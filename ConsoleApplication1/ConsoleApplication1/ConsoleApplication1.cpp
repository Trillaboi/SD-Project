// ConsoleApplication1.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <stdio.h>
#include <Windows.h>
#include <Xinput.h>
#include <iostream>
#include <string>
#include <fstream>
//#include <input.h>

#define GAMEPAD_BUTTONS_COUNT 14

#define XINPUT_GAMEPAD_LEFT_THUMB_DEADZONE  7849
#define XINPUT_GAMEPAD_RIGHT_THUMB_DEADZONE 8689
#define XINPUT_GAMEPAD_TRIGGER_THRESHOLD 30

#define INPUT_DEADZONE 4000



enum GAMEPAD_BUTTONS {
	GAMEPAD_BUTTON_DPAD_UP = XINPUT_GAMEPAD_DPAD_UP,
	GAMEPAD_BUTTON_DPAD_DOWN = XINPUT_GAMEPAD_DPAD_DOWN,
	GAMEPAD_BUTTON_DPAD_RIGHT = XINPUT_GAMEPAD_DPAD_RIGHT,
	GAMEPAD_BUTTON_DPAD_LEFT = XINPUT_GAMEPAD_DPAD_LEFT,

	GAMEPAD_BUTTON_START = XINPUT_GAMEPAD_START,
	GAMEPAD_BUTTON_VIEW = XINPUT_GAMEPAD_BACK,

	GAMEPAD_BUTTON_LEFT_THUMB = XINPUT_GAMEPAD_LEFT_THUMB,
	GAMEPAD_BUTTON_RIGHT_THUMB = XINPUT_GAMEPAD_RIGHT_THUMB,

	GAMEPAD_BUTTON_DPAD_SHOULDER_RIGHT = XINPUT_GAMEPAD_RIGHT_SHOULDER,
	GAMEPAD_BUTTON_DPAD_SHOULDER_LEFT = XINPUT_GAMEPAD_LEFT_SHOULDER,

	GAMEPAD_BUTTON_A = XINPUT_GAMEPAD_A,
	GAMEPAD_BUTTON_X = XINPUT_GAMEPAD_X,
	GAMEPAD_BUTTON_B = XINPUT_GAMEPAD_B,
	GAMEPAD_BUTTON_Y = XINPUT_GAMEPAD_Y
};

//struct gamepad_t {
//	BUTTON_STATE buttons[GAMEPAD_BUTTONS_COUNT];
//	vec2_t left_stick;
//	vec2_t right_stick;
//	float left_shoulder;
//	float right_shoulder;
//};

int main(void)
{

	DWORD dwResult;
	WORD lastClicked = 0;
	DWORD formerDwPacketNumber = 0;
	for (DWORD i = 0; i < XUSER_MAX_COUNT; i++)
	{
		XINPUT_STATE state;
		ZeroMemory(&state, sizeof(XINPUT_STATE));

		// Simply get the state of the controller from XInput.
		dwResult = XInputGetState(i, &state);

		if (dwResult == ERROR_SUCCESS)
		{
			// Controller is connected
			printf("Connected to the controller!\n");
			while (true)
			{
				if (GetKeyState(VK_ESCAPE) & 0x8000)
				{
					break;
				}
				XInputGetState(i, &state);
				if (state.dwPacketNumber != formerDwPacketNumber) {

					short RXAnalog = 0;
					short RYAnalog = 0;
					short LXAnalog = 0;
					short LYAnalog = 0;

					float RX = state.Gamepad.sThumbRX;
					float RY = state.Gamepad.sThumbRY;
					float LX = state.Gamepad.sThumbLX;
					float LY = state.Gamepad.sThumbLY;

					float magnitudeR = sqrt(RX * RX + RY * RY);
					float magnitudeL = sqrt(LX * LX + LY * LY);

					
					float normalizedMagnitudeL = 0;

					if (magnitudeL > INPUT_DEADZONE) {
						if (magnitudeL > 32767) 
							magnitudeL = 32767; // Magnitude is set to its maximum value if it exceeds its threshold.
						
						// adjust magnitude relative relative to the end of the dead zone
						magnitudeL -= INPUT_DEADZONE;

						//optionally normalize the magnitude with respect to its expected range
						//giving a magnitude value of 0.0 to 1.0
						normalizedMagnitudeL = magnitudeL / (32767 - INPUT_DEADZONE);
					}
					else // if controller crosses the deazone set the magnitude to zero
					{
						magnitudeL = 0.0;
						normalizedMagnitudeL = 0.0;
					}

					float normalizedMagnitudeR = 0;
					if (magnitudeR > INPUT_DEADZONE) {
						if (magnitudeR > 32767) 
							magnitudeR = 32767;
						


						magnitudeR -= INPUT_DEADZONE;
						normalizedMagnitudeR = magnitudeR / (32767 - INPUT_DEADZONE);
					}
					else
					{
						magnitudeR = 0.0;
						normalizedMagnitudeR = 0.0;
					}
					printf("[LeftThumb: %lf, RightThumb: %lf]\n", magnitudeL, magnitudeR);
					Sleep(10);

					if ((lastClicked & GAMEPAD_BUTTON_DPAD_UP) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_UP)) {
						printf("Up: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_UP));
					}
					if ((lastClicked & GAMEPAD_BUTTON_DPAD_DOWN) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_DOWN)) {
						printf("Down: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_DOWN) >> 1);
					}
					if ((lastClicked & GAMEPAD_BUTTON_DPAD_LEFT) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_LEFT)) {
						printf("Left: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_LEFT) >> 2);
					}
					if ((lastClicked & GAMEPAD_BUTTON_DPAD_RIGHT) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_RIGHT)) {
						printf("Right: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_RIGHT) >> 3);
					}
					if ((lastClicked & GAMEPAD_BUTTON_START) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_START)) {
						printf("Menu: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_START) >> 4);
					}
					if ((lastClicked & GAMEPAD_BUTTON_VIEW) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_VIEW)) {
						printf("View: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_VIEW) >> 5);
					}
					if ((lastClicked & GAMEPAD_BUTTON_LEFT_THUMB) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_LEFT_THUMB)) {
						printf("L Stick: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_LEFT_THUMB) >> 6);
					}
					if ((lastClicked & GAMEPAD_BUTTON_RIGHT_THUMB) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_RIGHT_THUMB)) {
						printf("R Stick: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_RIGHT_THUMB) >> 7);
					}
					if ((lastClicked & GAMEPAD_BUTTON_DPAD_SHOULDER_LEFT) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_SHOULDER_LEFT)) {
						printf("LB: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_SHOULDER_LEFT) >> 8);
					}
					if ((lastClicked & GAMEPAD_BUTTON_DPAD_SHOULDER_RIGHT) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_SHOULDER_RIGHT)) {
						printf("RB: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_DPAD_SHOULDER_RIGHT) >> 9);
					}
					if ((lastClicked & GAMEPAD_BUTTON_A) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_A)) {
						printf("A: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_A) >> 12);
					}
					if ((lastClicked & GAMEPAD_BUTTON_B) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_B)) {
						printf("B: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_B) >> 13);
					}
					if ((lastClicked & GAMEPAD_BUTTON_X) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_X)) {
						printf("X: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_X) >> 14);
					}
					if ((lastClicked & GAMEPAD_BUTTON_Y) < (state.Gamepad.wButtons & GAMEPAD_BUTTON_Y)) {
						printf("Y: %d \n", (state.Gamepad.wButtons & GAMEPAD_BUTTON_Y) >> 15);
					}


					lastClicked = state.Gamepad.wButtons;
					formerDwPacketNumber = state.dwPacketNumber;
				
				}
				
			}
		}
		else
		{
			// Controller is not connected
			printf("Not connected");
		}
	}

	return 0;
}

