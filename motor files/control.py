import pi_servo_hat
import time

# Initialize Constructor
test = pi_servo_hat.PiServoHat()

# Restart Servo Hat (in case Hat is frozen/locked)
test.restart()

# Test Run
#########################################
#i = 1.0
#while i > 0.5:
    
    # Moves servo position to 0 degrees (1ms), Channel 0
#    print(str(i) + " sec interval\n")
#    test.move_servo_position(0,-70, 180)

    # Pause 1 sec
#    time.sleep(i)

    # Moves servo position to 180 degrees (2ms), Channel 0
#    test.move_servo_position(0, 250, 180)

    # Pause 1 sec
#    time.sleep(i)
#    i = i - 0.1

#input control
#about 70 degrees off, still accepts -70 and 250
while True:
    position = int(input("Enter position angle: "))#
    if position >= 0 or position <= 180:
        test.move_servo_position(0, position,180)
        
