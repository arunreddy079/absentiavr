var socket = io();

function download() {
    var stream = ss.createStream();
    ss(socket).emit('file', stream);
    var chunks = []
    stream.on('data', function (chunk) {
        chunks.push(chunk)
    }).on('end', function () {
        blob = new Blob(chunks);
        var downloadUrl = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "data.xlsx";
        document.body.appendChild(a);
        a.click();
    });
}