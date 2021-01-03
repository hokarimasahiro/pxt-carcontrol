// tests go here; this will not be compiled when this package is used as a library
carcotrol.setCarType(carType.Porocar)
basic.forever(function () {
    if (carcotrol.getLineColor(Position.Left, lineColor.White)) led.plot(0, 2);
    else led.unplot(0,2);
    if (carcotrol.getLineColor(Position.Right, lineColor.White)) led.plot(4, 2);
    else led.unplot(4,2);
})
