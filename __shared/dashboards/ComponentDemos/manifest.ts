import type { ComponentType } from 'react'

import ContainerMain from '../../atoms/containers/container-main/demo/Demo'
import ContainerLight from '../../atoms/containers/container-light/demo/Demo'
import ContainerDark from '../../atoms/containers/container-dark/demo/Demo'
import ContainerNeg from '../../atoms/containers/container-neg/demo/Demo'
import ContainerCell from '../../atoms/containers/container-cell/demo/Demo'
import ContainerHeavy from '../../atoms/containers/container-heavy/demo/Demo'
import ContainerPanel from '../../atoms/containers/container-panel/demo/Demo'
import ContainerMetal from '../../atoms/containers/container-metal/demo/Demo'
import ContainerGhost from '../../atoms/containers/container-ghost/demo/Demo'
import ContainerBlueprint from '../../atoms/containers/container-blueprint/demo/Demo'
import ContainerGrid from '../../atoms/containers/container-grid/demo/Demo'
import ContainerOutline from '../../atoms/containers/container-outline/demo/Demo'
import ContainerEdge from '../../atoms/containers/container-edge/demo/Demo'
import ContainerWell from '../../atoms/containers/container-well/demo/Demo'
import SiteNav from '../../atoms/containers/site-nav/demo/Demo'
import TabNav from '../../atoms/containers/tab-nav/demo/Demo'

import ButtonSolid from '../../atoms/buttons/button-solid/demo/Demo'
import ButtonGlow from '../../atoms/buttons/button-glow/demo/Demo'
import ButtonGhost from '../../atoms/buttons/button-ghost/demo/Demo'
import ButtonConsole from '../../atoms/buttons/button-console/demo/Demo'
import ButtonUnderline from '../../atoms/buttons/button-underline/demo/Demo'
import ButtonAngled from '../../atoms/buttons/button-angled/demo/Demo'
import ButtonIcon from '../../atoms/buttons/button-icon/demo/Demo'
import ButtonOutlined from '../../atoms/buttons/button-outlined/demo/Demo'
import SiteNavButton from '../../atoms/buttons/site-nav-button/demo/Demo'
import TabNavButton from '../../atoms/buttons/tab-nav-button/demo/Demo'

import StatelessForm from '../../components/StatelessFormV3/demo/Demo'

export interface DemoProps {
    name?: string,
    id?: string,
    Demo?: ComponentType
}

// EACH Demo IMPORTS ITS OWN ATOM CSS (line 1 of every demo/Demo.tsx), so listing
// one here is the only step -- nothing needs importing at the page.
export const CONTAINERS: DemoProps[] = [{
    name: 'container-main', id: 'container-main', Demo: ContainerMain
},{
    name: 'container-light', id: 'container-light', Demo: ContainerLight
},{
    name: 'container-dark', id: 'container-dark', Demo: ContainerDark
},{
    name: 'container-neg', id: 'container-neg', Demo: ContainerNeg
},{
    name: 'container-cell', id: 'container-cell', Demo: ContainerCell
},{
    name: 'container-heavy', id: 'container-heavy', Demo: ContainerHeavy
},{
    name: 'container-panel', id: 'container-panel', Demo: ContainerPanel
},{
    name: 'container-metal', id: 'container-metal', Demo: ContainerMetal
},{
    name: 'container-ghost', id: 'container-ghost', Demo: ContainerGhost
},{
    name: 'container-blueprint', id: 'container-blueprint', Demo: ContainerBlueprint
},{
    name: 'container-grid', id: 'container-grid', Demo: ContainerGrid
},{
    name: 'container-outline', id: 'container-outline', Demo: ContainerOutline
},{
    name: 'container-edge', id: 'container-edge', Demo: ContainerEdge
},{
    name: 'container-well', id: 'container-well', Demo: ContainerWell
},{
    name: 'site-nav', id: 'site-nav', Demo: SiteNav
},{
    name: 'tab-nav', id: 'tab-nav', Demo: TabNav
}]

export const ATOMS: DemoProps[] = [{
    name: 'button-solid', id: 'button-solid', Demo: ButtonSolid
},{
    name: 'button-glow', id: 'button-glow', Demo: ButtonGlow
},{
    name: 'button-ghost', id: 'button-ghost', Demo: ButtonGhost
},{
    name: 'button-console', id: 'button-console', Demo: ButtonConsole
},{
    name: 'button-underline', id: 'button-underline', Demo: ButtonUnderline
},{
    name: 'button-angled', id: 'button-angled', Demo: ButtonAngled
},{
    name: 'button-icon', id: 'button-icon', Demo: ButtonIcon
},{
    name: 'button-outlined', id: 'button-outlined', Demo: ButtonOutlined
},{
    name: 'site-nav-button', id: 'site-nav-button', Demo: SiteNavButton
},{
    name: 'tab-nav-button', id: 'tab-nav-button', Demo: TabNavButton
}]

export const COMPONENTS: DemoProps[] = [{
    name: 'StatelessForm', id: 'stateless-form', Demo: StatelessForm
}]
