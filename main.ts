/*
  robot car control block for Maqueen and Tiny:bit
*/

//% color=#006464 weight=20 icon="\uf1b9" block="Car Control"
enum carType {
    //% block=Tinybit
    Tinybit = 1,
    //% block=Maqueen
    Maqueen = 2,
    //% block=unknown
    Unknown = 0
}
enum Position {
    //% block=Left
    Left = 1,
    //% block=Right
    Right = 2,
    //% block=Both
    Both = 0
}
enum CarState {
    //% block=Run
    Run = 1,
    //% block=Back
    Back = 2,
    //% block=Left
    Left = 3,
    //% block=Right
    Right = 4,
    //% block=Stop
    Stop = 5,
    //% block=SpinLeft
    SpinLeft = 6,
    //% block=SpinRight
    SpinRight = 7
}
/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

namespace carcotrol {
    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) {
    }

    let cartype = 0
    let stripPin = DigitalPin.P0
    let _length=5
    let buf=pins.createBuffer(_length*3);
    let brightness: number;

    let I2C_ADD: number
    const I2C_ADD_Tinybit = 0x01
    const I2C_ADD_Maqueen = 0x10

    function init() {
        if (cartype == carType.Unknown) {
            if (testi2c.testReadI2c(I2C_ADD_Tinybit) == 0) {
                cartype = carType.Tinybit;
                stripPin = DigitalPin.P12
            }
            if (testi2c.testReadI2c(I2C_ADD_Maqueen) == 0) {
                cartype = carType.Maqueen;
                stripPin = DigitalPin.P15
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
     * Run the car with the specified action.
     * @param speed Car speed in 0-255. eg:50
     */
    //% blockId="CarCtrl" block="CarCtrl|%index|speed %speed"
    //% weight=92 blockGap=10
    //% speed.min=0 speed.max=255
    export function CarCtrl(index: CarState, speed: number): void {
        if (cartype == carType.Unknown) init();

        switch (index) {
            case CarState.Run: setPwmMotor(speed, speed); break;
            case CarState.Back: setPwmMotor(-speed, -speed); break;
            case CarState.Left: setPwmMotor(0, speed); break;
            case CarState.Right: setPwmMotor(speed, 0); break;
            case CarState.Stop: setPwmMotor(0, 0); break;
            case CarState.SpinLeft: setPwmMotor(-speed, speed); break;
            case CarState.SpinRight: setPwmMotor(speed, -speed); break;
        }
    }

    /**
     * Run a car at a specified speed.
     * @param speedL Left Moter Power in 0-255. eg:50
     * @param speedR Right Motor Power in 0-255. eg:50
     */
    //% blockId="CarCtrl2" block="CarCtrl| speedL %speedL| speedR %speedR"
    //% weight=91 blockGap=10
    //% speedL.min=-255 speedL.max=255 speedR.min=-255 speedR.max=255
    export function CarCtrl2(speedL: number, speedR: number): void {
        if (cartype == carType.Unknown) init();

        setPwmMotor(speedL, speedR)
    }

    /**
     * Sense a line color.
     */
    //% blockId="Line_Sensor" block="Line_Sensor|direct %direct"
    //% weight=89 blockGap=10
    export function Line_Sensor(direct: Position): number {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Maqueen) {
            if (direct == Position.Left) {
                return pins.digitalReadPin(DigitalPin.P13)
            } else if (direct == Position.Right) {
                return pins.digitalReadPin(DigitalPin.P14)
            }

        } else if (cartype == carType.Tinybit) {
            if (direct == Position.Left)
                return pins.digitalReadPin(DigitalPin.P13);
            else if (direct == Position.Right)
                return pins.digitalReadPin(DigitalPin.P14);
        }
        return -1;
    }

    /**
     * Get Voice Level.
     */
    //% blockId="Voice_Sensor" block="Voice Sensor"
    //% weight=88 blockGap=10
    export function Voice_Sensor(): number {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Tinybit) {
            return pins.analogReadPin(AnalogPin.P1);
        }
        return -1;
    }

    /**
     * Get Distance.
     */
    //% blockId="Get_distance" block="get distance(cm)"
    //% weight=87 blockGap=10
    export function getDistance(): number {
        let pinT: number
        let pinR: number
        let list: Array<number> = [0, 0, 0, 0, 0];

        if (cartype == carType.Unknown) init();

        if (cartype == carType.Maqueen) {
            pinT = DigitalPin.P1
            pinR = DigitalPin.P2
        } else if (cartype == carType.Tinybit) {
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

    /**
     * Set LED to a given color.
    */

    //% blockId="set_LED" block="set LED color|led %pos|color %color=carcontrol_colors"
    //% weight=86 blockGap=10
    export function setLED(pos: Position, color: number): void {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Maqueen) {
            if (pos == Position.Left || pos == Position.Both) {
                pins.digitalWritePin(DigitalPin.P8, color == NeoPixelColors.Black ? 0 : 1)
            }
            if (pos == Position.Right || pos == Position.Both) {
                pins.digitalWritePin(DigitalPin.P12, color == NeoPixelColors.Black ? 0 : 1)
            }
        } else if (cartype == carType.Tinybit) {
            setPwmRGB((color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff)
        }
    }
    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b). 
     * @param rgb RGB color of the LED
     */
    //% blockId="neopixel_set_strip_color" block="%strip|show color %rgb=carcontrol_colors" 
    //% weight=85 blockGap=8
    export function showColor(rgb: number) {
        rgb = rgb >> 0;
        setAllRGB(rgb);
        show();
    }

    /**
     * Set LED to a given color (range 0-255 for r, g, b). 
     * You need to call ``show`` to make the changes visible.
     * @param pixeloffset position of the NeoPixel in the strip
     * @param rgb RGB color of the LED
     */
    //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=carcontrol_colors" 
    //% weight=83 blockGap=8
    export function setPixelColor(pixeloffset: number, rgb: number): void {
        setPixelRGB(pixeloffset >> 0, rgb >> 0);
    }

    /**
     * Send all the changes to the strip.
     */
    //% blockId="neopixel_show" block="%strip|show"
    //% weight=81 blockGap=8
    export function show() {
        sendBuffer(buf, stripPin);
    }

    /**
     * Turn off all LEDs.
     * You need to call ``show`` to make the changes visible.
     */
    //% blockId="neopixel_clear" block="%strip|clear"
    //% weight=79 blockGap=8
    export function clear(): void {
        buf.fill(0, 0, _length * 3);
        show()
    }
    /**
     * Set NeoPixel brightness.
     * @param bright in 0-255. eg:50
     */
    //% blockId="set_Neo_Brightness" block="set Neo Brightness %bright"
    //% weight=77 blockGap=8
    //% bright.min=0 bright.max=255
    export function setNeoBrightness(bright: number): void {
        if (cartype == carType.Unknown) init();

        brightness=bright
    }
    function setBufferRGB(offset: number, red: number, green: number, blue: number): void {
        buf[offset + 0] = green;
        buf[offset + 1] = red;
        buf[offset + 2] = blue;
    }

    function setAllRGB(rgb: number) {
        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        const br = brightness;
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        for (let i = 0; i < _length; ++i) {
            setBufferRGB(i * 3, red, green, blue)
        }
    }
    function setPixelRGB(pixeloffset: number, rgb: number): void {
        if(pixeloffset < 0
                || pixeloffset >= _length)
                return;

        pixeloffset = pixeloffset * 3;

        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        let br = brightness;
        if(br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
            setBufferRGB(pixeloffset, red, green, blue)
    }
    /**
     * change red and green.
     * @param rgb eg: 0x00ffc0
     */
    //% blockId="neopixel_change_red_and_green" block="%strip|change red and green in %rgb"
    //% weight=75 blockGap=8
    //% advanced=true
    export function changeRandG(rgb: number): number {
        return packRGB(unpackG(rgb), unpackR(rgb), unpackB(rgb));
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    //% advanced=true
    export function colors(color: NeoPixelColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
