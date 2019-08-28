/*
Copyright (C): 2010-2019, Shenzhen Yahboom Tech
modified from liusen
load dependency
"Tinybit": "file:../pxt-Tinybit"
*/

//% color="#006400" weight=20 icon="\uf1b9"
namespace Tinybit {

    const PWM_ADD = 0x01
    const MOTOR = 0x02
    const RGB = 0x01

    export enum enColor {
        //% block=OFF
        OFF = 0x000000,
        //% block=Red
        Red = 0x0000ff,
        //% block=Green
        Green = 0x00ff00,
        //% block=Blue
        Blue = 0xff0000,
        //% block=White
        White = 0xffffff,
        //% block=Cyan
        Cyan = 0xffff00,
        //% block=Pinkish
        Pinkish = 0xff00ff,
        //% block=Yellow
        Yellow = 0x00ffff
    }
    export enum enPos {

        //% block=LeftState
        LeftState = 0,
        //% block=RightState
        RightState = 1
    }
    export enum enLineState {
        //% block=WhiteLine
        White = 0,
        //% block=BlackLine
        Black = 1
    }
    export enum enTouchState {
        //% block=Get
        Get = 0,
        //% block=NoGet
        NoGet = 1
    }
    export enum enAvoidState {
        //% block=Obstacle
        OBSTACLE = 1,
        //% block=NoObstacle
        NOOBSTACLE = 0

    }
    export enum CarState {
        //% block=Run
        Car_Run = 1,
        //% block=Back
        Car_Back = 2,
        //% block=Left
        Car_Left = 3,
        //% block=Right
        Car_Right = 4,
        //% block=Stop
        Car_Stop = 5,
        //% block=SpinLeft
        Car_SpinLeft = 6,
        //% block=SpinRight
        Car_SpinRight = 7
    }

    function setPwmRGB(red: number, green: number, blue: number): void {

        let buf = pins.createBuffer(4);
        buf[0] = RGB;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;

        pins.i2cWriteBuffer(PWM_ADD, buf);
    }

    function setPwmMotor(speed1: number, speed2: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = MOTOR;
        if (speed1 >= 0){
            buf[1] = speed1;
            buf[2] = 0;
        } else {
            buf[1] = 0;
            buf[2] = 0 - speed1;
        }
        if (speed2 >= 0) {
            buf[3] = speed2;
            buf[4] = 0;
        } else {
            buf[3] = 0;
            buf[4] = 0 - speed2;
        }
        pins.i2cWriteBuffer(PWM_ADD, buf);
    }

    /**
     * *****************************************************************
     * @param index
     */

    //% blockId="Tinybit_RGB_Car_Big" block="RGB_Car_Big|color %color"
    //% weight=98
    //% blockGap=10
    export function RGB_Car_Big(color: enColor): void {

        setPwmRGB(color & 0x0000ff, color & 0x00ff00 >> 8, color & 0xff0000 >> 16)
    }
    //% blockId="Tinybit_RGB_Car_Big2" block="RGB_Car_Big2|value1 %value1|value2 %value2|value3 %value3"
    //% weight=97
    //% blockGap=10
    //% value1.min=0 value1.max=255 value2.min=0 value2.max=255 value3.min=0 value3.max=255
    export function RGB_Car_Big2(value1: number, value2: number, value3: number): void {

        setPwmRGB(value1, value2, value3);

    }

    //% blockId="Tinybit_CarCtrl" block="CarCtrl|%index"
    //% weight=93
    //% blockGap=10
    //% color="#006400"
    export function CarCtrl(index: CarState): void {
        switch (index) {
            case CarState.Car_Run: setPwmMotor(255, 255); break;
            case CarState.Car_Back: setPwmMotor(-255, -255); break;
            case CarState.Car_Left: setPwmMotor(0, 255); break;
            case CarState.Car_Right: setPwmMotor(255, 0); break;
            case CarState.Car_Stop: setPwmMotor(0,0); break;
            case CarState.Car_SpinLeft: setPwmMotor(-255, 255); break;
            case CarState.Car_SpinRight: setPwmMotor(255, -255); break;
        }
    }

    //% blockId="Tinybit_CarCtrlSpeed" block="CarCtrlSpeed|%index|speed %speed"
    //% weight=92
    //% blockGap=10
    //% speed.min=0 speed.max=255
    //% color="#006400"
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        switch (index) {
            case CarState.Car_Run: setPwmMotor(speed, speed); break;
            case CarState.Car_Back: setPwmMotor(-speed, -speed); break;
            case CarState.Car_Left: setPwmMotor(0, speed); break;
            case CarState.Car_Right: setPwmMotor(speed, 0); break;
            case CarState.Car_Stop: setPwmMotor(0,0); break;
            case CarState.Car_SpinLeft: setPwmMotor(-speed, speed); break;
            case CarState.Car_SpinRight: setPwmMotor(speed, -speed); break;
        }
    }

    //% blockId="Tinybit_CarCtrlSpeed2" block="CarCtrlSpeed| speedL %speedL| speedR %speedR"
    //% weight=91
    //% blockGap=10
    //% speedL.min=-255 speedL.max=255
    //% speedR.min=-255 speedR.max=255
    //% color="#006400"
    export function CarCtrlSpeed2(speedL: number, speedR: number): void {
        setPwmMotor(speedL, speedR)
    }

    //% blockId="Tinybit_Line_Sensor" block="Line_Sensor|direct %direct|value %value"
    //% weight=89
    //% blockGap=10
    //% color="#006400"
    export function Line_Sensor(direct: enPos, value: enLineState): boolean {

        let temp: boolean = false;
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
        switch (direct) {
            case enPos.LeftState: {
                if (pins.digitalReadPin(DigitalPin.P13) == value) {
                    temp = true;
                }
                else {
                    temp = false;
                }
                break;
            }

            case enPos.RightState: {
                if (pins.digitalReadPin(DigitalPin.P14) == value) {
                    temp = true;
                }
                else {
                    temp = false;
                }
                break;
            }
        }
        return temp;

    }

    //% blockId="Tinybit_Voice_Sensor" block="Voice Sensor return"
    //% weight=88
    //% blockGap=10
    export function Voice_Sensor(): number {
        //pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
        let temp = 0;
        temp = pins.analogReadPin(AnalogPin.P1);

        return temp;

    }

    //% blockId="Tinybit_Ultrasonic_Car" block="ultrasonic return distance(cm)"
    //% color="#006400"
    //% weight=87
    //% blockGap=10
    export function Ultrasonic_Car(): number {

        let list: Array<number> = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
            pins.digitalWritePin(DigitalPin.P16, 0);
            control.waitMicros(2);
            pins.digitalWritePin(DigitalPin.P16, 1);
            control.waitMicros(15);
            pins.digitalWritePin(DigitalPin.P16, 0);
            let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 43200);
            list[i] = Math.floor(d / 40);
        }
        list.sort();
        let length = (list[1] + list[2] + list[3]) / 3;
        return Math.floor(length);
    }
}
