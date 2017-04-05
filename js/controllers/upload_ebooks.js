/**
 * Created by Tauseef Naqvi on 09-03-2017.
 */
//inject angular file upload directives and services.
(function () {
    'use strict';
    var app = angular.module('fileUpload', ['ui.bootstrap', 'ngFileUpload','ImageCropper']);

    app.controller('MyCtrl', ['$scope', 'Upload', '$timeout', '$uibModal', function ($scope, Upload, $timeout,$uibModal) {

        this.imgCrop=function(picFile){
            var modalInstance = $uibModal.open({
                templateUrl: 'img_crop.html',
                controller: 'imgCrop',
                size: 'lg',
                resolve: {
                    picFile: function () {
                        return picFile;
                    }
                }
            });
            modalInstance.result.then(function (croppedPic) {
                var imageBase64 = croppedPic;
                var decodedImage = decodeBase64(imageBase64);
                var blob = new Blob([decodedImage], {type: 'image/png'});
                var croppedImg = new File([blob], 'imageFileName.png');
                $scope.croppedImg = croppedImg;
                console.log("Some thing is happining in modalInstance.result.then");
                // var blob = dataURItoBlob(croppedPic);
                // var croppedImg = new File([blob], 'fileName.jpeg', {type: "'image/jpeg"});
                // $scope.croppedImg = croppedImg;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

        };
        function dataURItoBlob(dataURI) {

            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }

        this.uploadFiles = function (file) {
            file.upload = Upload.upload({
                url: 'http://localhost:8080/api/ebooks/uploads',
                data: {
                    title: this.title, description: this.description,
                    tag: this.tag[0] + ',' + this.tag[1], cover: $scope.croppedPic, pdf: file
                },
            });
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    this.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
        function demoUpload() {
            var $uploadCrop;

            function readFile(input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $('.upload-demo').addClass('ready');
                        $uploadCrop.croppie('bind', {
                            url: e.target.result
                        }).then(function(){
                            console.log('jQuery bind complete');
                        });

                    }

                    reader.readAsDataURL(input.files[0]);
                }
                else {
                    swal("Sorry - you're browser doesn't support the FileReader API");
                }
            }

            $uploadCrop = $('#upload-demo').croppie({
                viewport: {
                    width: 100,
                    height: 100,
                    type: 'circle'
                },
                enableExif: true
            });

            $('#upload').on('change', function () { readFile(this); });
            $('.upload-result').on('click', function (ev) {
                $uploadCrop.croppie('result', {
                    type: 'canvas',
                    size: 'viewport'
                }).then(function (resp) {
                    popupResult({
                        src: resp
                    });
                });
            });
        };
        demoUpload();
    }]);
    app.controller('imgCrop', function ($scope, $uibModalInstance, picFile) {
        var fileReader = new FileReader();
            fileReader.readAsDataURL(picFile);
            fileReader.onload = function(e) {
                $scope.imgSrc = this.result;
                $scope.$apply();
            };
            $scope.cropFile = function (croppedImg) {

                $uibModalInstance.close(croppedImg);

            }

        $scope.close = function () {
            $scope.imageCropStep = 1;
            delete $scope.imgSrc;
            delete $scope.result;
            delete $scope.resultBlob;
            $uibModalInstance.dismiss('cancel');
        };
    });
}());
