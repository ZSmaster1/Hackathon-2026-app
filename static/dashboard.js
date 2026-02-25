fetch('/user', { method: 'GET' }).then((res) => {
    res.json().then((data) => {
        document.querySelector('#greeting').textContent = "Good Morning " + data.id;

        const avgs = [];
        const groups = []

        for (const course of data.courses) {
            const mark = course?.categories?.avg;
            if (mark != null) {
                avgs.push(mark);
                groups.push({
                    label: course.course.split(':')[0].trim(),
                    bars: [0, mark]
                })
            }
        }

        const sum = avgs.reduce((a, b) => a + b, 0);
        const avg = (sum / avgs.length) || 0;

        document.querySelector('#mark').textContent = Math.round(avg.toString());

        let canvas = document.getElementById('progressCanvas');
        if (canvas) {
            let ctx = canvas.getContext('2d');
            let size = canvas.width;
            let center = size / 2;
            let radius = center - 12;
            let lineWidth = 10;

            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#e8e4f0';
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            let progress = avg/100;
            let startAngle = -Math.PI / 2;
            let endAngle = startAngle + progress * Math.PI * 2;

            ctx.beginPath();
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.strokeStyle = '#7c5cfc';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.fillStyle = '#d4ccf0';
            ctx.beginPath();
            ctx.arc(center, center - 8, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(center, center + 20, 22, 16, 0, Math.PI, 0, true);
            ctx.fill();
        }

        //bar chart
        let barCanvas = document.getElementById('barChart');
        if (barCanvas) {
            let bctx = barCanvas.getContext('2d');
            let w = barCanvas.width;
            let h = barCanvas.height;
            let padding = 40;
            let chartH = h - padding - 20;
            let maxVal = 60;

            bctx.fillStyle = '#8b8b9e';
            bctx.font = '11px sans-serif';
            bctx.textAlign = 'right';

            let yLabels = [100, 80, 60, 40, 20];
            yLabels.forEach(function (val) {
                let y = padding + chartH - (val / maxVal) * chartH;
                bctx.fillText(String(val), 30, y + 4);
                bctx.strokeStyle = '#f0eef5';
                bctx.lineWidth = 1;
                bctx.beginPath();
                bctx.moveTo(38, y);
                bctx.lineTo(w - 10, y);
                bctx.stroke();
            });


            let groupWidth = (w - 50) / groups.length;
            let barWidth = 16;
            let gap = 4;

            groups.forEach(function (group, gi) {
                let gx = 42 + gi * groupWidth + groupWidth / 2;

                group.bars.forEach(function (val, bi) {
                    let barH = (val / maxVal) * chartH;
                    let x = gx - barWidth - gap / 2 + bi * (barWidth + gap);
                    let y = padding + chartH - barH;

                    bctx.fillStyle = bi === 0 ? '#d4ccf0' : '#7c5cfc';
                    bctx.beginPath();
                    bctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
                    bctx.fill();
                });

                bctx.fillStyle = '#8b8b9e';
                bctx.font = '10px sans-serif';
                bctx.textAlign = 'center';
                bctx.fillText(group.label, gx, h - 4);
            });
        }
    })
})