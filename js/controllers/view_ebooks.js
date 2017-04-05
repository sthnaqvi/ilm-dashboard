/**
 * Created by Tauseef Naqvi on 17-03-2017.
 */
(function () {
    'use strict';
    var app = angular.module('getEbooks', ['ui.bootstrap', 'ngFileUpload']);
    app.controller('EbookCtrl', EbookCtrl);
    // Functions - Definitions
    function EbookCtrl($http, $uibModal) {
        // Variables - Private
        var self = this;
        var host = "http://localhost:8080"; // define host http://localhost:8080
        var skip = 0;
        var limitPerPage = 10;
        // Variables - Public
        self.limitPerPage = limitPerPage;
        self.host = host;

        $http.get(host + "/api/ebooks?skip=" + skip)
            .then(function (response) {
                self.books = response.data;
                skip = skip + limitPerPage;
                onLoad(0);
            })
            .catch(function (error) {
                console.log(error);
            });
        var onLoad = function (i) {
            $http.get(host + "/api/ebooks?skip=" + skip)
                .then(function (response) {
                    for (var j = 0; j < response.data.length; j++)
                        self.books.push(response.data[j]);
                    skip = skip + limitPerPage;
                    console.log("When i=" + i + "Response lenth =" + response.data.length);
                    i++;
                    if (response.data.length >= limitPerPage)
                        onLoad(i);
                })
                .catch(function (error) {
                    console.log(error);
                })

        };
        self.bookEdit = function (bookId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'edit_ebook.html',
                controller: 'editEbook',
                resolve: {
                    bookId: function () {
                        return bookId;
                    }
                }
            });

        };
        self.deleteEbook = function (ebookId, indexPosition) {
            $http.delete(host + "/api/ebooks/" + ebookId)
                .then(function (response) {
                    self.books.splice(indexPosition, 1);
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    };
    app.controller('editEbook', function ($scope, $http, $uibModalInstance, bookId) {
        var host = "http://localhost:8080";
        $http.get(host + "/api/ebooks/" + bookId)
            .then(function (response) {
                $scope.book = response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
    app.directive('ngConfirmClick', [
        function () {
            return {
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "Are you sure?";
                    var clickAction = attr.confirmedClick;
                    element.bind('click', function (event) {
                        if (window.confirm(msg)) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
        }])
}());