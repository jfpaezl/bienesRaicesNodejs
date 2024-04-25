import { Dropzone } from 'dropzone'

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imagenes aqui',
    acceptedFiles: '.png,.jpg,.jpeg,.gif,.bmp.webp',
    maxFilesize: 5,
    maxFile: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar archivo',
    dictMaxFilesExceeded: 'Solo puedes subir una imagen',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function(){
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar')

        btnPublicar.addEventListener('click', function(e){
            dropzone.processQueue()
            dropzone.on('queuecomplete', function(){
                if(dropzone.getQueuedFiles().length == 0){
                    window.location.href = '/mis-propiedades'
                }
            })
        })
    }
}