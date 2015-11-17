import FlappySimulator = require('../flappybird/FlappySimulator');
import FlappyAdapter = require('../adapter/FlappyAdapter');
import Timer = require('./Timer');

/**
 * Timer class which controls how often a DQN
 * for flappybird is ticked
 */
class FlappyDQNTimer extends Timer {
	public static FRAMES_PER_TICK = 6;

	private flappySimulator;
	private flappyAdapter;
	private frameCount;

    private onGameOver: Function;

    constructor(
        flappySimulator: FlappySimulator,
        flappyAdapter: FlappyAdapter,
        onTick: Function,
        onGameOver?: Function
    ) {
		super(onTick);
		this.frameCount = 0;
        this.flappySimulator = flappySimulator;
        this.flappyAdapter = flappyAdapter;
        this.onGameOver = onGameOver || function(){};
	}

    public frame() {
        // When we die, call onGameOver()
        if (this.flappySimulator.isDead()) {
            this.onGameOver();
        }

        // Always run the simulation
        // The simulation will stop and reset the tick after dying
        if (!this.flappySimulator.isRunning()) {
            this.frameCount = 0;
            this.flappyAdapter.onGameStart();
        }

        var lastScore = this.flappySimulator.getScore();

        // Update the simulation
        this.flappySimulator.update();

        var scored = this.flappySimulator.getScore() - lastScore > 0;

        // Update the parent ticker
        this.frameCount++;

        // Update our brain if we have ticked over a threshold,
        // have died, or have scored.
        if (this.frameCount > FlappyDQNTimer.FRAMES_PER_TICK ||
            this.flappySimulator.isDead() ||
            scored) {
            if (this.flappySimulator.isRunning()) {
                this.onTick();
            }
            this.frameCount = 0;
        }
    }
}

export = FlappyDQNTimer;