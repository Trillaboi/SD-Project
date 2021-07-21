from xinput import *

def commands(output):
    for key, value in output.items():
        if value == True:
            print(key)
        elif value != False and value != 0:
            print(key, value)

if __name__ == '__main__':
    x = XInput('default.ini')
    while True:
        output = {}
        if not x.get_state() and output:
            print('\n'.join(['{} = {}'.format(key, value) for key, value in output.items()]))
            time.sleep(0.2)
            os.system('cls')
            continue
        for thumb in x.THUMBS.keys():
            if x.is_thumb_move(thumb):
                output[thumb] = x.get_thumb_value(thumb)
            else:
                output[thumb] = 0
        for trigger in x.TRIGGERS.keys():
            if x.is_trigger_press(trigger):
                output[trigger] = x.get_trigger_value(trigger)
            else:
                output[trigger] = 0
        for button in x.BUTTONS.keys():
            output[button] = x.is_button_press(button)
            x.set_debounce_vibration(0.0, 0.0, 0.1) # set vibration here if needed
        # print('\n'.join(['{} = {}'.format(key, value) for key, value in output.items()]))
        commands(output)
        # time.sleep(0.2)
        # os.system('cls')
