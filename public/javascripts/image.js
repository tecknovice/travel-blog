$(function () {
    $('.image-container').find('img').each(function () {
        var imgClass = ((this.width / this.height) > 1) ? 'wide' : 'tall';
        $(this).addClass(imgClass);
    })
})