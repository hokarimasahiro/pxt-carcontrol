// tests go here; this will not be compiled when this package is used as a library
carcotrol.setCarType(carType.Ecocar)
basic.forever(function () {
    for(let i=0;i<=255;i++){
        carcotrol.plotBarGraph(i, i)
        basic.pause(10)
    }
    basic.pause(1000)
    for(let i=0;i>=-255;i--){
        carcotrol.plotBarGraph(i, i)
        basic.pause(10)
    }
    basic.pause(1000)
})
