from xinput import *
import sys, os, json

class Controller():

    def __init__(self):
        self.xInput = XInput('python_scripts\default.ini')
        self.noInput = {'LEFT_THUMB_X': 0, 'LEFT_THUMB_-X': 0, 'LEFT_THUMB_Y': 0, 'LEFT_THUMB_-Y': 0, 'RIGHT_THUMB_X': 0, 'RIGHT_THUMB_-X': 0, 'RIGHT_THUMB_Y': 0, 'RIGHT_THUMB_-Y': 0, 'LEFT_TRIGGER': 0, 'RIGHT_TRIGGER': 0, 'DPAD_UP': False, 'DPAD_DOWN': False, 'DPAD_LEFT': False, 'DPAD_RIGHT': False, 'START': False, 'BACK': False, 'LEFT_THUMB': False, 'RIGHT_THUMB': False, 'LEFT_SHOULDER': False, 'RIGHT_SHOULDER': False, 'A': False, 'B': False, 'X': False, 'Y': False}

    def commands(self, output):
        if output != self.noInput:
            try:
                output = json.dumps(output)
            except:
                pass
            print(output, file=sys.stderr)

    def main(self):
        while True:
            output = {}
            if not self.xInput.get_state() and output:
                print('\n'.join(['{} = {}'.format(key, value) for key, value in output.items()]))
                time.sleep(0.2)
                os.system('cls')
                continue
            for thumb in self.xInput.THUMBS.keys():
                if self.xInput.is_thumb_move(thumb):
                    output[thumb] = self.xInput.get_thumb_value(thumb)
                else:
                    output[thumb] = 0
            for trigger in self.xInput.TRIGGERS.keys():
                if self.xInput.is_trigger_press(trigger):
                    output[trigger] = self.xInput.get_trigger_value(trigger)
                else:
                    output[trigger] = 0
            for button in self.xInput.BUTTONS.keys():
                output[button] = self.xInput.is_button_press(button)
                self.xInput.set_debounce_vibration(0.0, 0.0, 0.1) # set vibration here if needed
            # print('\n'.join(['{} = {}'.format(key, value) for key, value in output.items()]))
            self.commands(output)
            # time.sleep(0.2)
            # os.system('cls')
if __name__ == '__main__':
    instance = Controller()
    instance.main()
