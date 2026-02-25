fetch('/user', { method: 'GET' }).then((res) => {
    res.json().then((data) => {
        document.querySelector('#greeting').textContent = "Good Morning " + data.id;

        const avgs = [];
        const groups = []
        const table = document.querySelector('#coursetable');
        for (const course of data.courses) {
            const mark = course?.categories?.avg;
            table.innerHTML += `
            <div class="grid items-center gap-4 px-5 py-3"
                style="grid-template-columns:1.5fr 1fr 1.5fr auto;">

                <p class="text-sm text-foreground">${course.course}</p>
                <p class="text-sm text-foreground">${mark != null ? mark : 'No mark available'}</p>
                <p class="text-sm text-foreground">${mark == null ? 'N/A' : (parseFloat(mark) < 90 ? 'Explore the study resources' : 'You are doing great!')}</p>


            </div>
            
            `;
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
    })
})