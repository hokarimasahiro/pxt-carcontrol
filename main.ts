/*
  robot car control block for Maqueen and Tiny:bit
*/

enum carType {
    //% block=Tinybit
    Tinybit = 1,
    //% block=Maqueen
    Maqueen = 2,
    //% block=Ecocar
    Ecocar = 4,
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
enum RGBColors {
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

//% color=#006464 weight=20 icon="\uf1b9" block="Car Control"
namespace carcotrol {
    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) {
    }

    let initFlag = 0;
    let cartype = 0
    let stripPin = DigitalPin.P0
    let _length = 5
    let buf = pins.createBuffer(_length * 3);
    let brightness: number;
    let distance = -1;
    let oldDistance = -1;

    let I2C_ADD: number
    const I2C_ADD_Tinybit = 0x01
    const I2C_ADD_Maqueen = 0x10
    const I2C_ADD_Ecocar = 0x20

    function init() {
        if (initFlag == 0) {
            control.inBackground(function () {
                measureDistance()
            })
            initFlag = 1;
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
        } else if (cartype == carType.Ecocar) {
            if (speedL >= 0) {
                pins.digitalWritePin(DigitalPin.P12, 0)
                pins.analogWritePin(AnalogPin.P8, speedL * 4);
            } else {
                pins.digitalWritePin(DigitalPin.P8, 0)
                pins.analogWritePin(AnalogPin.P12, (0 - speedL) * 4);
            }
            if (speedR >= 0) {
                pins.digitalWritePin(DigitalPin.P16, 0)
                pins.analogWritePin(AnalogPin.P14, speedR * 4);
            } else {
                pins.digitalWritePin(DigitalPin.P14, 0)
                pins.analogWritePin(AnalogPin.P16, (0 - speedR) * 4);
            }
        }
    }

    /**
     * Run the car with the specified action.
     * @param speed Car speed in 0-255. eg:50
     */
    //% blockId="CarCtrl" block="CarCtrl|%index|speed %speed"
    //% speed.min=0 speed.max=255
    export function CarCtrl(index: CarState, speed: number): void {
        if (cartype == carType.Unknown) init();
        let wSpeed = Math.constrain(speed, -255, 255)

        switch (index) {
            case CarState.Run: setPwmMotor(wSpeed, wSpeed); break;
            case CarState.Back: setPwmMotor(0 - wSpeed, 0 - wSpeed); break;
            case CarState.Left: setPwmMotor(0, wSpeed); break;
            case CarState.Right: setPwmMotor(wSpeed, 0); break;
            case CarState.Stop: setPwmMotor(0, 0); break;
            case CarState.SpinLeft: setPwmMotor(0 - wSpeed, wSpeed); break;
            case CarState.SpinRight: setPwmMotor(wSpeed, 0 - wSpeed); break;
        }
    }

    /**
     * Run a car at a specified speed.
     * @param speedL Left Moter Power in 0-255. eg:50
     * @param speedR Right Motor Power in 0-255. eg:50
     */
    //% blockId="CarCtrl2" block="CarCtrl| speedL %speedL| speedR %speedR"
    //% speedL.min=-255 speedL.max=255 speedR.min=-255 speedR.max=255
    export function CarCtrl2(speedL: number, speedR: number): void {
        if (cartype == carType.Unknown) init();

        let wSpeedL = Math.constrain(speedL, -255, 255);
        let wSpeedR = Math.constrain(speedR, -255, 255);

        setPwmMotor(wSpeedL, wSpeedR);
    }

    /**
     * set car type.
     * @param carType carType in carType. eg:carType.Maqueen
     */
    //% blockId="set_car_type" block="set car type|%carType"
    //% advanced=true
    export function setCarType(type: carType): void {
        init();
        cartype = type
    }

    /**
     * get car type.
     */
    //% blockId="get_car_type" block="get car type"
    //% weight=90 blockGap=10
    //% advanced=true
    export function getCarType(): carType {
        if (cartype == carType.Unknown) init();
        return cartype
    }

    /**
     * car type.
     */
    //% blockId="car" block="%car_type"
    //% advanced=true
    export function car(car_type: carType): number {
        return car_type;
    }

    /**
     * Sense a line color.
     */
    //% blockId="Line_Sensor" block="Line_Sensor|direct %direct"
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
                return 1 - pins.digitalReadPin(DigitalPin.P13);
            else if (direct == Position.Right)
                return 1 - pins.digitalReadPin(DigitalPin.P14);
        } else if (cartype == carType.Ecocar) {
            if (direct == Position.Left)
                return pins.analogReadPin(AnalogPin.P1) < 800 ? 1 : 0;
            else if (direct == Position.Right)
                return pins.analogReadPin(AnalogPin.P2) < 800 ? 1 : 0;
        }
        return -1;
    }

    /**
     * Get Voice Level.
     */
    //% blockId="Voice_Sensor" block="Voice Sensor"
    export function Voice_Sensor(): number {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Tinybit) {
            return pins.analogReadPin(AnalogPin.P1);
        }
        return -1;
    }

    function measureDistance(): void {
        const usParCm = 43 //58    // 1000000[uS] / (340[m/S](sped of sound) * 100(cm)) * 2(round trip)
        let pinT: number
        let pinR: number
        let list: Array<number> = [0, 0, 0, 0, 0];
        let listIndex=0;

        while (true) {
            if (cartype != carType.Unknown) {
                if (cartype == carType.Maqueen) {
                    pinT = DigitalPin.P1
                    pinR = DigitalPin.P2
                } else if (cartype == carType.Tinybit) {
                    pinT = DigitalPin.P16
                    pinR = DigitalPin.P15
                } else if (cartype == carType.Ecocar) {
                    pinT = DigitalPin.P1
                    pinR = DigitalPin.P2
                }
                pins.setPull(pinT, PinPullMode.PullNone);
                pins.digitalWritePin(pinT, 0);
                control.waitMicros(2);
                pins.digitalWritePin(pinT, 1);
                control.waitMicros(10);
                pins.digitalWritePin(pinT, 0);

                list[listIndex] = pins.pulseIn(pinR, PulseValue.High, 800 * usParCm);
                listIndex++;
                if(listIndex >= list.length) listIndex=0;

                list.sort();
                distance=(list[1]+list[2]+list[3])/3
            }
            basic.pause(50);
        }
    }
    /**
     * Get Distance.
     */
    //% blockId="Get_distance" block="get distance(cm)"
    export function getDistance(): number {
        const usParCm = 43; //58    // (1[S] / 340[m/S](sped of sound)) * 10^6(uS/S) / 100(cm/m) * 2(round trip)
        if (cartype == carType.Unknown) init();
        return distance / usParCm;
    }

    /**
     * Set LED to a given color.
    */

    //% blockId="set_LED" block="set LED color|led %pos|color %color=carcontrol_colors"
    export function setLED(pos: Position, color: number): void {
        if (cartype == carType.Unknown) init();

        if (cartype == carType.Maqueen) {
            if (pos == Position.Left || pos == Position.Both) {
                pins.digitalWritePin(DigitalPin.P8, color == RGBColors.Black ? 0 : 1)
            }
            if (pos == Position.Right || pos == Position.Both) {
                pins.digitalWritePin(DigitalPin.P12, color == RGBColors.Black ? 0 : 1)
            }
        } else if (cartype == carType.Tinybit) {
            setPwmRGB((color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff)
        }
    }
    /**
     * show barGraph.
     * @param l Left level in -255 to 255. eg:50
     * @param r Right level in -255 to 255. eg:50
     */
    //% blockId="plotBarGraph" block="plotBarGraph|%l|%r"
    //% l.min=-255 l.max=255 r.min=-255 r.max=255
    export function plotBarGraph(l: number, r: number): void {
        if (cartype == carType.Unknown) init();

        let wl = Math.constrain(Math.trunc(l / 25), -9, 9);
        let wr = Math.constrain(Math.trunc(r / 25), -9, 9);

        for(let y=0;y<5;y++){
            for(let x=0;x<2;x++){
                if(wl>=0){
                    if (wl > (y * 2 + x)){
                        led.plot(1 - x,4 - y)
                    } else {
                        led.unplot(1 - x,4 - y)
                    }
                }else{
                    if ((0 - wl)>(4 - y) *2 + x){
                        led.plot(1 - x,4 - y);
                    }else {
                        led.unplot(1 - x,4 - y);
                    }
                }
                if(wr>=0){
                    if (wr > (y * 2 + x)){
                        led.plot(3 + x,4 - y)
                    } else {
                        led.unplot(3 + x,4 - y)
                    }
                }else{
                    if ((0 - wr)>(4 - y) *2 + x){
                        led.plot(3 + x,4 - y);
                    }else {
                        led.unplot(3 + x,4 - y);
                    }
                }
            }
        }
    }

    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b). 
     * @param rgb RGB color of the LED
     */
    //% blockId="set_set_color" block="set neo color %rgb=carcontrol_colors" 
    export function setNeoColor(rgb: number) {
        rgb = rgb >> 0;
        setAllRGB(rgb);
        show();
    }

    /**
     * Set LED to a given color (range 0-255 for r, g, b). 
     * You need to call ``show`` to make the changes visible.
     * @param pixeloffset position of the Neo
     * @param rgb RGB color of the LED
     */
    //% blockId="et_neo_pixel_color" block="set neo pixel color at %pixeloffset|to %rgb=carcontrol_colors" 
    export function setNeoPixelColor(pixeloffset: number, rgb: number): void {
        setPixelRGB(pixeloffset >> 0, rgb >> 0);
        show();
    }

    /**
     * Send all the changes to the strip.
     */
    //% blockId="neopixel_show" block="%strip|show"
    //% advanced=true
    export function show() {
        let Pin: DigitalPin

        if (cartype == carType.Unknown) return;
        if (cartype == carType.Tinybit) Pin = DigitalPin.P12;
        if (cartype == carType.Maqueen) Pin = DigitalPin.P15;
        if (cartype == carType.Ecocar) Pin = DigitalPin.P0;

        sendBuffer(buf, Pin);
    }

    /**
     * Turn off all LEDs.
     * You need to call ``show`` to make the changes visible.
     */
    //% blockId="neopixel_clear" block="%strip|clear"
    //% advanced=true
    export function clear(): void {
        buf.fill(0, 0, _length * 3);
        show()
    }
    /**
     * Set NeoPixel brightness.
     * @param bright in 0-255. eg:50
     */
    //% blockId="set_Neo_Brightness" block="set Neo Brightness %bright"
    //% bright.min=0 bright.max=255
    export function setNeoBrightness(bright: number): void {
        if (cartype == carType.Unknown) init();

        brightness = bright
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
        if (pixeloffset < 0
            || pixeloffset >= _length)
            return;

        pixeloffset = pixeloffset * 3;

        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        let br = brightness;
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        setBufferRGB(pixeloffset, red, green, blue)
    }
    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * change red and green.
     * @param rgb eg: 0x00ffc0
     */
    //% blockId="neopixel_change_red_and_green" block="change red and green in %rgb"
    //% advanced=true
    export function changeRandG(rgb: number): number {
        return packRGB(unpackG(rgb), unpackR(rgb), unpackB(rgb));
    }

    /**
     * Gets the RGB value of a known color
    */
    //% blockId="carcontrol_colors" block="%color"
    export function colors(color: RGBColors): number {
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
