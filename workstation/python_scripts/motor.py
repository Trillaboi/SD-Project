import pi_servo_hat, sys, time, enum, signal, subprocess

@enum.unique
class CommandEnum(enum.Enum):
    MOVE_SERVO_ONE: 'move_one'
    MOVE_SERVO_TWO: 'move_two'

    @staticmethod
    def list():
        return list(map(lambda command: command.value, CommandEnum))

# class Command:
#     defenitions = {
#         CommandEnum.MOVE_SERVO_ONE: {'template': ''}
#         CommandEnum.MOVE_SERVO_ONE: {'template': ''}
#     }

# class Message:
#     def __init__(self, command: CommandEnum, args: Sequence[str] = []) -> None:
#         self.command = command
#         self.args = args
#
#     @classmethod
#     def from_text(cls: Message, message_text: str) -> Message:
#         command = None

command_values = CommandEnum.list()
class Motor:
    def __init__(self):
        self.servo = pi_servo_hat.PiServoHat()
        self.servo.restart()

    def change_frequency(self, x):
        self.servo.set_pwm_frequency(x)

    def move_servo_one(self, position):
        self.servo.move_servo_position(0, position, 180)

    def move_servo_two(self, position):
        self.servo.move_servo_position(1, position, 180)

    def set_servos_start(self):
        self.move_servo_one(75)
        self.move_servo_two(0)

    def main(self):
        for line in sys.stdin:
            if "||" in line:
                command = line.split("||")[1]
                print(command, file=sys.stderr)
            else:
                continue

            if "move_one" in command:
                x = int(command.split(" ")[1])
                self.move_servo_one(x)
            elif "move_two" in command:
                x = int(command.split(" ")[1])
                self.move_servo_two(x)

        sys.exit(0)



def signal_quit(signal, frame):
    sys.exit(0)

if __name__ in "__main__":
    print("starting motor.py")
    signal.signal(signal.SIGINT, signal_quit)
    x = Motor()
    x.change_frequency(36)
    x.set_servos_start()
    x.servo.get_pwm_frequency()
    x.main()
