import { useEffect } from 'react'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import { MotionSync } from "live2d-motionsync";

window.PIXI = PIXI

Live2DModel.registerTicker(PIXI.Ticker)

PIXI.Renderer.registerPlugin("interaction", PIXI.InteractionManager);



function Live2DComponent() {
    useEffect(() => {
        const app = new PIXI.Application({
            view: document.getElementById("canvas"),
            autoStart: true,
            resizeTo: window,
        });



        Live2DModel.from("Hu Tao/Hu Tao.model3.json", {
            idleMotionGroup: "Idle"
        }).then((model) => {
            app.stage.addChild(model);
            model.anchor.set(0.5, 0.5);
            model.position.set(window.innerWidth / 2, window.innerHeight + window.innerHeight / 4);
            model.scale.set(0.2, 0.2);

            const motionSync = new MotionSync(model.internalModel);
            motionSync.loadMotionSyncFromUrl("Hu Tao/Hu tao.motionsync3.json");

            let currentMotion = null;
            model.on("pointertap", async () => {
                if (currentMotion) {
                    motionSync.reset()
                    await model.motion('Motion_1')
                    currentMotion = null;
                    console.log("Stopped");

                } else {
                    model.motion("Talk");
                    currentMotion = motionSync.play("Hu Tao/sounds/talk.wav");
                    await currentMotion.then(() => {
                        currentMotion = null;
                        console.log("Finished playing");
                    });

                    console.log("Playing");
                }
            });

        });
    }, []);

    return (
        <>

            <canvas
                id="canvas"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '20%',
                    height: 'auto'
                }}
            />;
        </>
    )

}

export default Live2DComponent
