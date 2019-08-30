/*
*/

//% color=#006464 weight=20 icon="\uf1b9" block="Car Control"
namespace carcotrol {

    let cartype = 0
    let strip: neopixel.Strip

    let I2C_ADD: number
    const I2C_ADD_Tinybit = 0x01
    const I2C_ADD_Maqueen = 0x10

    export enum carType {
        //% block=Tinybit
        Tinybit = 1,
        //% block=Maqueen
        Maqueen = 2,
        //% block=unknown
        Unknown = 0
    }
    export enum enColor {
        //% block=black
        black = 0x000000,
        //% block=Red
        Red = 0xff0000,
        //% block=Green
        Green = 0x00ff00,
        //% block=Blue
        Blue = 0x0000ff,
        //% block=White
        White = 0xffffff,
        //% block=Cyan
        Cyan = 0x00ffff,
        //% block=Pink
        Pink = 0xff00ff,
        //% block=Yellow
        Yellow = 0xffff00
    }
    export enum enPos {
        //% block=Left
        Left = 1,
        //% block=Right
        Right = 2,
        //% block=Both
        Both = 0
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
    function init() {
        if (cartype == carType.Unknown) {
            if (testi2c.testReadI2c(I2C_ADD_Tinybit) == 0) {
                cartype = carType.Tinybit;
                strip = neopixel.create(DigitalPin.P12, 2)
            }
            if (testi2c.testReadI2c(I2C_ADD_Maqueen) == 0)
            {
                cartype = carType.Maqueen;
                strip = neopixel.create(DigitalPin.P15, 4)
            }
        }
    }

    function setPwmRGB(red: number, green: number, blue: number): void {
        if (cartype != carType.Tinybit) return;

        let buf = pins.createBuffer(4);
        buf[0] = 0x01;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;

        pins.i2cWriteBuffer(I2C_ADD_Tinybit, buf);
    }

    function setPwmMotor(speedL: number, speedR: number): void {
        if (cartype == carType.Tinybit) {
            let buf = pins.createBuffer(5);
            buf[0] = 0x02;
            if (speedL >= 0) {
                buf[1] = speedL;
                buf[2] = 0;
            } else {
                buf[1] = 0;
                buf[2] = 0 - speedL;
            }
            if (speedR >= 0) {
                buf[3] = speedR;
                buf[4] = 0;
            } else {
                buf[3] = 0;
                buf[4] = 0 - speedR;
            }
            pins.i2cWriteBuffer(I2C_ADD_Tinybit, buf);
        } else if (cartype == carType.Maqueen) {
            let buf = pins.createBuffer(3);
            buf[0] = 0x00;
            if (speedL >= 0) {
                buf[1] = 0;
                buf[2] = speedL;
            } else {
                buf[1] = 1;
                buf[2] = 0 - speedL;
            }
            pins.i2cWriteBuffer(I2C_ADD_Maqueen, buf);

            buf[0] = 0x02;
            if (speedR >= 0) {
                buf[1] = 0;
                buf[2] = speedR;
            } else {
                buf[1] = 1;
                buf[2] = 0 - speedR;
            }
            pins.i2cWriteBuffer(I2C_ADD_Maqueen, buf);
        }
    }
    /**
     * Set LED to a given color.
     */

    //% blockId="set_LED" block="set LED color|led %pos|color %color"
    //% weight=98 blockGap=10
    export function setLED(pos: enPos, color: enColor): void {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Maqueen) {
            if (pos == enPos.Left || pos == enPos.Both) {
                pins.digitalWritePin(DigitalPin.P8, color == enColor.black ? 0 : 1)
            }
            if (pos == enPos.Right || pos == enPos.Both) {
                pins.digitalWritePin(DigitalPin.P12, color == enColor.black ? 0 : 1)
            }
        } else if (cartype == carType.Tinybit) {
            setPwmRGB((color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff)
        }
    }
    /**
     * Set NeoPixel to a given color (range 0- 255 for red, green, blue).
     */
    //% blockId="set_NeoPixel" block="set NeoPixel No %no color %color"
    //% weight=97 blockGap=10
    export function setNEO(no:number,color:enColor): void {
        if (cartype == carType.Unknown) init();

        if(cartype==carType.Maqueen){
            if(no>4) return;
            if(no==0){
                for(let i=0;i<4;i++) strip.setPixelColor(i,color);
            } else strip.setPixelColor(no-1,color);
            strip.show();
        } else if (cartype == carType.Tinybit) {
            if (no > 2) return;
            if (no == 0) {
                for (let i = 0; i < 2; i++) strip.setPixelColor(i, color);
            } else strip.setPixelColor(no-1, color);
            strip.show();
        }
    }

    /**
     * Run the car with the specified action.
     * @param speed Car speed in 0-255. eg:50
     */
    //% blockId="Tinybit_CarCtrlSpeed" block="CarCtrlSpeed|%index|speed %speed"
    //% weight=92 blockGap=10
    //% speed.min=0 speed.max=255
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        if (cartype == carType.Unknown) init();

        switch (index) {
            case CarState.Car_Run: setPwmMotor(speed, speed); break;
            case CarState.Car_Back: setPwmMotor(-speed, -speed); break;
            case CarState.Car_Left: setPwmMotor(0, speed); break;
            case CarState.Car_Right: setPwmMotor(speed, 0); break;
            case CarState.Car_Stop: setPwmMotor(0, 0); break;
            case CarState.Car_SpinLeft: setPwmMotor(-speed, speed); break;
            case CarState.Car_SpinRight: setPwmMotor(speed, -speed); break;
        }
    }

    /**
     * Run a car at a specified speed.
     * @param speedL Left Moter Power in 0-255. eg:50
     * @param speedR Right Motor Power in 0-255. eg:50
     */
    //% blockId="Tinybit_CarCtrlSpeed2" block="CarCtrlSpeed| speedL %speedL| speedR %speedR"
    //% weight=91 blockGap=10
    //% speedL.min=-255 speedL.max=255 speedR.min=-255 speedR.max=255
    export function CarCtrlSpeed2(speedL: number, speedR: number): void {
        if (cartype == carType.Unknown) init();

        setPwmMotor(speedL, speedR)
    }

    /**
     * Sense a line color.
     */
    //% blockId="Tinybit_Line_Sensor" block="Line_Sensor|direct %direct|value %value"
    //% weight=89 blockGap=10
    export function Line_Sensor(direct: enPos): number {
        if (cartype == carType.Unknown) init();

        if(cartype==carType.Maqueen){
            if (direct == enPos.Left) {
                return pins.digitalReadPin(DigitalPin.P13)
            } else if (direct == enPos.Right) {
                return pins.digitalReadPin(DigitalPin.P14)
            }

        } else if(cartype==carType.Tinybit){
            if (direct == enPos.Left)
                return pins.digitalReadPin(DigitalPin.P13);
            else if (direct == enPos.Right)
                return pins.digitalReadPin(DigitalPin.P14);
        }
        return -1;
    }

    /**
     * Get Voice Level.
     */
    //% blockId="Tinybit_Voice_Sensor" block="Voice Sensor return"
    //% weight=88 blockGap=10
    export function Voice_Sensor(): number {
        if (cartype == carType.Unknown) init();

        if(cartype==carType.Tinybit){
            return pins.analogReadPin(AnalogPin.P1);
        }
        return -1;
    }

    /**
     * Get Distance.
     */
    //% blockId="Tinybit_Ultrasonic_Car" block="ultrasonic return distance(cm)"
    //% weight=87 blockGap=10
    export function Ultrasonic_Car(): number {
        let pinT:number
        let pinR:number
        let list: Array<number> = [0, 0, 0, 0, 0];

        if (cartype == carType.Unknown) init();

        if(cartype==carType.Maqueen){
            pinT = DigitalPin.P1
            pinR = DigitalPin.P2
        }else      if (cartype == carType.Tinybit) {
            pinT = DigitalPin.P16
            pinR = DigitalPin.P15
        } else return -1;

        for (let i = 0; i < 5; i++) {
            pins.setPull(pinT, PinPullMode.PullNone);
            pins.digitalWritePin(pinT, 0);
            control.waitMicros(2);
            pins.digitalWritePin(pinT, 1);
            control.waitMicros(15);
            pins.digitalWritePin(pinT, 0);
            let d = pins.pulseIn(pinR, PulseValue.High, 43200);
            list[i] = Math.floor(d / 40);
        }
        list.sort();
        let length = (list[1] + list[2] + list[3]) / 3;
        return Math.floor(length);
    }
}
