import React, { Fragment, ReactElement } from 'react'

export type IAdditionalLayers = ReactElement[];

interface IAdditionalLayersProps {
    layers: IAdditionalLayers
}

/**
 * Renders any additional layer feature groups
 */
const AdditionalLayers: React.FC<IAdditionalLayersProps> = (props) => {
    return (
        <>
            {props.layers.map((additionalLayer: ReactElement, index: number) => (
                <Fragment key={index}>{additionalLayer}</Fragment>
            ))}
        </>
    )
}

export default AdditionalLayers
