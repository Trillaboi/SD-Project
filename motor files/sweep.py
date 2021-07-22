import pi_servo_hat
import time

# Initialize Constructor
test = pi_servo_hat.PiServoHat()

# Restart Servo Hat (in case Hat is frozen/locked)
test.restart()

# Sweep
#########################################
while True:
    for i in range(0, 180):
        print(i)
        test.move_servo_position(0, i, 180)
        test.move_servo_position(1, i, 180)
        time.sleep(.01)
    for i in range(180, 0, -1):
        print(i)
        test.move_servo_position(0, i, 180)
        test.move_servo_position(1, i, 180)
        time.sleep(.01)

#########################################