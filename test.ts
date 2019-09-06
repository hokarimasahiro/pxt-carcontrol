// tests go here; this will not be compiled when this package is used as a library
carcotrol.setCarType(carType.Maqueen)
basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        carcotrol.setCarType(carType.Maqueen)
        carcotrol.CarCtrl(CarState.Run, 255)
    } else {
        carcotrol.setCarType(carType.Maqueen)
        carcotrol.CarCtrl(CarState.Stop, 0)
    }
    basic.pause(100)
})
