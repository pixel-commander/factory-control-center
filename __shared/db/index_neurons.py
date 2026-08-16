"""index_neurons -- scan the brain, read every neuron header, list what's there.

    python index_neurons.py <brain-root>            report only
    python index_neurons.py <brain-root> --json out.json
    python index_neurons.py <brain-root> --write    put them in the db

THE FOLDER IS FACT, the index is a reading of it. This never edits a neuron
and never deletes a row -- it reports. [[indexers-are-reconcilers]]

A NEURON IS A BLOCK, not a file. One file can hold many:

    ==============================
    Folder Name:
    Neuron Name: my-brain-does-not-index-time
    Hint: ...
    Summary: ...
    Details: ...
          continued lines are indented and belong to the field above
    ==============================

So the match key is (location, name) -- the file it lives in plus its name.
An indexer without a stable key is a duplicator.
"""
import json
import os
import sys

FENCE = '=========='          # a rule of '=' opens and closes a block
FIELDS = {                    # header label -> column
    'folder name': 'folder',
    'folder': 'folder',
    'neuron name': 'name',
    'neuron': 'name',
    'hint': 'hint',
    'summary': 'summary',
    'details': 'details',
    'tags': 'tags',
    'connections': 'connections',
    'ganglion': 'ganglion',
    'nucleus': 'nucleus',
    'parent': 'parent',
    'neurons': 'neurons',
    'private': 'private',
    'skill': 'skill',
    'memory': 'memory',
    'title': 'title',
    'description': 'description',
}
READ_EXT = ('.txt', '.md', '.neuron')
SKIP_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'dist', 'build'}


def is_fence(line):
    """A fence is a line of nothing but '=' (at least ten of them)."""
    bare = line.strip()
    return bare.startswith(FENCE) and set(bare) == {'='}


def split_label(line):
    """'Hint: he is vague' -> ('hint', 'he is vague'). None if not a header."""
    if ':' not in line:
        return None
    label, _, rest = line.partition(':')
    key = label.strip().lower()
    if key in FIELDS and not label.startswith((' ', '\t')):
        return FIELDS[key], rest.strip()
    return None


def read_blocks(path, root):
    """Every neuron block in one file. Continuation lines join their field."""
    try:
        text = open(path, encoding='utf-8', errors='replace').read()
    except OSError:
        return []

    location = os.path.relpath(path, root).replace('\\', '/')
    found, block, field, open_fence = [], None, None, False

    for line in text.splitlines():
        if is_fence(line):
            if open_fence and block and block.get('name'):
                block['location'] = location
                found.append(block)
            block, field, open_fence = {}, None, not open_fence
            continue
        if not open_fence:
            continue

        hit = split_label(line)
        if hit:
            field, value = hit
            block[field] = value
        elif field and line.strip():
            block[field] = (block.get(field, '') + '\n' + line.strip()).strip()

    if open_fence and block and block.get('name'):      # unclosed last block
        block['location'] = location
        found.append(block)
    return found


def scan(root):
    """Walk the brain. Returns (neurons, files_read)."""
    neurons, files = [], 0
    for here, dirs, names in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for name in names:
            if not name.lower().endswith(READ_EXT):
                continue
            files += 1
            for one in read_blocks(os.path.join(here, name), root):
                one.setdefault('folder', os.path.relpath(here, root).replace('\\', '/'))
                if one['folder'] == '.':
                    one['folder'] = ''
                neurons.append(one)
    return neurons, files


def report(neurons, files, root):
    """What the scan saw -- and what it could not read."""
    print('brain     %s' % root)
    print('files     %d read' % files)
    print('neurons   %d found' % len(neurons))

    seen, dupes = {}, []
    for one in neurons:
        key = (one['location'], one['name'])
        if key in seen:
            dupes.append(key)
        seen[key] = one

    thin = [o['name'] for o in neurons if not o.get('summary') and not o.get('details')]
    homeless = [o['name'] for o in neurons if not o.get('folder')]

    if dupes:
        print('\nSAME NAME TWICE IN ONE FILE (%d) -- one will win:' % len(dupes))
        for location, name in dupes:
            print('  %-44s %s' % (name, location))
    if thin:
        print('\nNO BODY (%d) -- header only:' % len(thin))
        for name in thin[:20]:
            print('  %s' % name)
    if homeless:
        print('\nNO FOLDER (%d) -- sitting at the brain root:' % len(homeless))
        for name in homeless[:20]:
            print('  %s' % name)

    folders = {}
    for one in neurons:
        folders[one['folder'] or '(root)'] = folders.get(one['folder'] or '(root)', 0) + 1
    print('\nBY FOLDER')
    for folder in sorted(folders):
        print('  %-44s %d' % (folder, folders[folder]))


def write_db(neurons):
    """Put them in the neurons table. Match on (location, name) so a rerun
       edits instead of inserting -- that is the whole difference between an
       indexer and a duplicator."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import base_db

    have = {(r.get('location'), r.get('name')): r for r in base_db.read('neurons')}
    made = changed = same = 0

    for one in neurons:
        row = dict(one)
        row.setdefault('title', row['name'].replace('-', ' '))
        row.setdefault('description', row.get('hint', ''))
        row['origin'] = 'other'
        row['added_by'] = 'index_neurons'

        old = have.get((row['location'], row['name']))
        if not old:
            base_db.write('neurons', row)
            made += 1
            continue
        diff = {k: v for k, v in row.items()
                if k not in ('origin', 'added_by') and str(old.get(k) or '') != str(v or '')}
        if diff:
            base_db.edit('neurons', old['id'], diff)
            changed += 1
        else:
            same += 1

    print('\nDB  %d new  %d edited  %d unchanged' % (made, changed, same))
    gone = [k for k in have if k not in {(o['location'], o['name']) for o in neurons}]
    if gone:
        print('IN THE DB BUT NOT IN THE BRAIN (%d) -- not touched, your call:' % len(gone))
        for location, name in gone:
            print('  %-44s %s' % (name, location))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        return 1
    root = os.path.abspath(args[0])
    if not os.path.isdir(root):
        print('no brain at %s' % root)
        return 1

    neurons, files = scan(root)
    report(neurons, files, root)

    if '--json' in sys.argv:
        where = sys.argv[sys.argv.index('--json') + 1]
        open(where, 'w', encoding='utf-8').write(json.dumps(neurons, indent=2))
        print('\nwrote %s' % where)
    if '--write' in sys.argv:
        write_db(neurons)
    return 0


if __name__ == '__main__':
    sys.exit(main())
