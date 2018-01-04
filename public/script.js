(function() {

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const clickX = new Array();
    const clickY = new Array();
    const clickDrag = new Array();
    var signed;

    $('canvas').on('mousedown', function(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        signed = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        sign();
    })

    $('canvas').on('mousemove', function(e) {
        if(signed) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            sign();
        }
    })

    $('canvas').on('mouseup', function(e) {
        signed = false;
        var sig = document.getElementById('signature').toDataURL();
        $('input[name=signature]').val(sig);
        console.log(sig);
    })

    //CLICKING FUNCTION
    function addClick (x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    //FUNCTION TO SIGN
    function sign() {
        ctx.strokeStyle = "#FB5130";
        ctx.lineWidth = 2;

        for(var i=0; i < clickX.length; i++) {

            ctx.beginPath();

            if (clickDrag[i] && i) {
                ctx.moveTo(clickX[i-1], clickY[i-1]);
            }

            else {
                ctx.moveTo(clickX[i]-1, clickY[i]);
            }

            ctx.lineTo(clickX[i], clickY[i]);
            ctx.closePath();
            ctx.stroke();
        }

    }

})(); //end of IFEE
