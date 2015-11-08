var convnetjs = require('../vendor/convnetjs/convnet-min.js');
var deepqlearn = require('../vendor/convnetjs/deepqlearn.js');
var game = require('../vendor/flappy/main.js');

// brain.epsilon_test_time = 0.0; // don't make any more random choices
// brain.learning = false;

class FlappyBrain {

    private onAction;
    private onGetState;
    private onStart;
    private brain;
    private numIterations = 0;

    constructor(onAction, onGetState, onStart) {
        this.onAction = onAction;
        this.onGetState = onGetState;
        this.onStart= onStart;
        this.brain = new deepqlearn.Brain(5, 2);
    }

    public train() {
        this.onStart();
        this.numIterations++;
        this.update(this.onGetState());
    }

    private update(gameState) {
        console.log(gameState);
        if (gameState.status) {
            // Compute action
            var action = this.brain.forward([gameState.birdY - gameState.pipeY, gameState.pipeX]);
            this.onAction(action);

            setTimeout(() => {
                var gameState = this.onGetState();

                var reward = gameState.frames;
                if (!gameState.status) {
                    reward = -1000;
                } else if (gameState.pipeY) {
                    var distanceReward = 1.0 - Math.abs(gameState.pipeY - gameState.birdY) / 420.0;
                    reward += distanceReward;
                }

                console.log(reward);
                this.brain.backward(reward);
                this.update(gameState);
            }, 300);
        } else if (this.numIterations < 100) {
            this.train();
        } else {
            // Done training
        }
    }

    public test() {

    }

    public saveBrain() {
        localStorage.setItem('trained_brain', JSON.stringify(this.brain.value_net.toJSON()));
    }
}

export = FlappyBrain;
