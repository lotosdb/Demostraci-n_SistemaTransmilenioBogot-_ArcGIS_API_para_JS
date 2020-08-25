require([
    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/renderers/UniqueValueRenderer",
], function (WebScene, SceneView, FeatureLayer, UniqueValueRenderer) {
    // Create view and load an existing webscene into it
    const webscene = new WebScene({
        portalItem: {
            // autocasts as new PortalItem()
            id: "e46e52ea75b34f7ebc9af6abdbadd848"
        }
    });

    const view = new SceneView({
        container: "viewDiv",
        map: webscene,
        qualityProfile: "high",
        environment: {
            lighting: {
                directShadowsEnabled: true,
                ambientOcclusionEnabled: true
            },
            atmosphere: {
                quality: "high"
            }
        }
    });

    /*************************************************
     * These options can be set on a PathSymbol3DLayer.
     * `profile` changes the shape of the path to be either
     * rectangular or round, `cap` styles the start and
     * end vertices of the path and `join` styles the start
     * and end vertices of the segments along the path.
     * `profileRotation` controls the rotation of the profile
     * along the path.
     **************************************************/
    const options = {
        profile: "quad",
        cap: "round",
        join: "miter",
        width: 20,
        height: 30,
        color: [200, 200, 200],
        profileRotation: "all"
    };

    /* The colors used for the each transit line */
    const colors = {
        1: [255, 0, 16],//Americas rojo
        2: [0, 166, 63],//Auto NOrte morado
        3: [103, 187, 254],//Auto Sur azul claro
        4: [233, 212, 98],//El Dorado pastel
        5: [209, 162, 3],//Cll 6 Amarillo quemado
        6: [81, 0, 189],//Calle 80 Morado
        7: [0, 0, 255],//Av Caracas Azul
        8: [255, 158, 0],//Av Caracas Sur naranja
        9: [0, 139, 211],//Carrera 10 Azul aguamarina
        10: [103, 187, 100],//San Mateo verde-azulado
        11: [251, 186, 255],//Av Jimenez Rosado
        12: [209, 162, 3],//Av NQS Amarillo quemado
        13: [255, 255, 0]//Suba Amarillo
    };

    /****************************************
    * Function that sets a renderer with a
    * unique path symbol for each transit line.
    * The path symbol uses the properties from
    * the options object, which are set everytime
    * the user modifies the settings in the menu.
    * **************************************/
    const fieldsRenderer = {
        type: "simple",
        symbol: {
            type: "point-3d",
            width: "30px",
            height: "30px",
            symbolLayers: [{
                type: "icon",
                resource: {
                    href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Bus.svg",
                },
            }],
            verticalOffset: {
                screenLength: 40,
                maxWorldLength: 200,
                minWorldLength: 35
            },
            callout: {
                type: "line",
                color: "white",
                size: 2,
            }
        },
    }

    const label = {
        type: "label-3d",
        labelExpressionInfo: {
            expression: "$feature.nombre_est",
        },
        symbolLayers: [
            {
                type: "text",
                material: {
                    color: [0, 0, 0, 0.8]
                },
                font: {
                    size: 30,
                    family: "Avenir Next LT Pro Bold"
                }
            }
        ],
    }

    /* Create layer with the stations points */
    const stationLayer = new FeatureLayer({
        url: "https://geoportal.esri.co/server/rest/services/Hosted/TM/FeatureServer/0",
        renderer: fieldsRenderer,
        elevationInfo: {
            mode: "relative-to-ground",
        },
        labelingInfo: [label],
        title: "Estaciones de Transmilenio Bogotá",
    });
    webscene.add(stationLayer);

    /* Create layer with the transit lines */
    const transitLayer = new FeatureLayer({
        url: "https://geoportal.esri.co/server/rest/services/Hosted/TM/FeatureServer/1",
        elevationInfo: {
            mode: "relative-to-ground",
            offset: 30
        },
        title: "Troncales de Transmilenio Bogotá",
    });
    webscene.add(transitLayer);

    const portalLayer = new FeatureLayer({
        url: "https://integralportal.esri.co/server/rest/services/Hosted/Trasmilenio/FeatureServer/2",
        title: "Portales de Transmilenio Bogotá",
        opacity: 0.3,
        renderer: {
            type: "simple",
            symbol: {
                type: "polygon-3d",
                symbolLayers: [{
                    type: "extrude",
                    size: 200,
                    material: { color: "red" }
                }]
            }
        },
        elevationInfo: {
            mode: "relative-to-ground"
        }

    });
    webscene.add(portalLayer);


    /****************************************
     * Function that sets a renderer with a
     * unique path symbol for each transit line.
     * The path symbol uses the properties from
     * the options object, which are set everytime
     * the user modifies the settings in the menu.
     * **************************************/
    function renderTransitLayer() {
        const renderer = new UniqueValueRenderer({
            field: "nombre_tra"
        });

        for (let property in colors) {
            if (colors.hasOwnProperty(property)) {
                renderer.addUniqueValueInfo({
                    value: property,
                    symbol: {
                        type: "line-3d",
                        symbolLayers: [
                            {
                                type: "path",
                                profile: options.profile,
                                material: {
                                    color: colors[property]
                                },
                                width: options.width,
                                height: options.height,
                                join: options.join,
                                cap: options.cap,
                                anchor: "bottom",
                                profileRotation: options.profileRotation
                            }
                        ]
                    }
                });
            }
        }

        transitLayer.renderer = renderer;
    }

    renderTransitLayer();


    /*************************************************
     * The rest of the sample adds event listeners
     * on the input elements in the menu, to modify
     * the path properties in the options object and
     * rerender the layer.
     *************************************************/

    const styleSelect = document.getElementById("style");
    styleSelect.addEventListener("change", function (event) {
        const value = event.target.value;
        switch (value) {
            case "round-tube":
                options.profile = "circle";
                options.height = 30;
                options.width = 30;
                break;
            case "square-tube":
                options.profile = "quad";
                options.height = 30;
                options.width = 30;
                break;
            case "wall":
                options.profile = "quad";
                options.height = 30;
                options.width = 5;
                break;
            case "strip":
                options.profile = "quad";
                options.height = 5;
                options.width = 30;
                break;
        }
        renderTransitLayer();
    });

    const capSelect = document.getElementById("cap");
    capSelect.addEventListener("change", function (event) {
        options.cap = event.target.value;
        renderTransitLayer();
    });

    const joinSelect = document.getElementById("join");
    joinSelect.addEventListener("change", function (event) {
        console.log(event.target.value);
        options.join = event.target.value;
        renderTransitLayer();
    });

    
    view.ui.add("menu", "top-right");
});