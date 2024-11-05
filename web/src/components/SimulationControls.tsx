import { Button, Flex, Slider } from '@radix-ui/themes'
import { PlayIcon, PauseIcon, ResetIcon } from '@radix-ui/react-icons'

interface SimulationControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  speed: number
  onSpeedChange: (value: number) => void
}

const SimulationControls = ({
  isPlaying,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange
}: SimulationControlsProps) => {
  return (
    <Flex gap="4" align="center">
      <Button variant="soft" onClick={onPlayPause}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button variant="soft" onClick={onReset}>
        <ResetIcon />
      </Button>
      <Slider 
        defaultValue={[1]}
        max={5}
        min={0.1}
        step={0.1}
        value={[speed]}
        onValueChange={(value) => onSpeedChange(value[0])}
        style={{ width: 200 }}
      />
    </Flex>
  )
}

export default SimulationControls 