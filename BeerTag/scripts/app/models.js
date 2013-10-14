/*var app = app || {}

app = (function () {
    
    activitiesModel = (function () {
        var activityModel = {
            id: 'Id',
            fields: {
                Text: {
                    field: 'Text',
                    defaultValue: ''
                },
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                Picture: {
                    fields: 'Picture',
                    defaultValue: ''
                },
                UserId: {
                    field: 'UserId',
                    defaultValue: ''
                },
                Location: {
                    field: 'Location',
                    defaultValue: ''
                }
            },
            CreatedAtFormatted: function () {
                return AppHelper.formatDate(this.get('CreatedAt'));
            },
            PictureUrl: function () {
                return AppHelper.resolvePictureUrl(this.get('Picture'));
            },
            User: function () {
                var userId = this.get('UserId');
                var user = $.grep(usersModel.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? {
                    DisplayName: user.DisplayName,
                    PictureUrl: AppHelper.resolveProfilePictureUrl(user.Picture)
                } : {
                    DisplayName: 'Anonymous',
                    PictureUrl: AppHelper.resolveProfilePictureUrl()
                };
            }
        };
        var activitiesDataSource = new kendo.data.DataSource({
            type: 'everlive',
            
            schema: {
                model: activityModel
            },
            transport: {
                // required by Everlive
                typeName: 'Activities'
            },
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-activities-span').hide();
                }
                else {
                    $('#no-activities-span').show();
                }
            },
            sort: { field: 'CreatedAt', dir: 'desc' }
        });
        return {
            activities: activitiesDataSource
        };
    }());
    
    beersModel = (function () {
        var beerModel = {
            id: 'Id',
            fields: {
                Name: {
                    field: 'Name',
                    defaultValue: ''
                },
                DrinkCount: {
                    field: 'DrinkCount',
                    defaultValue: '0'
                },
                Abv: {
                    field: 'Abv',
                    defaultValue: '0'
                },
                Type: {
                    field: 'Type',
                    defaultValue: ''
                },
                Label: {
                    fields: 'Label',
                    defaultValue: ''
                }
            },
            LabelUrl: function () {
                return AppHelper.resolvePictureUrl(this.get('Label'));
            }
        };
        var beersDataSource = new kendo.data.DataSource({
            type: 'everlive',
            schema: {
                model: beerModel
            },
            transport: {
                // required by Everlive
                typeName: 'Beers'
            },
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-activities-span').hide();
                }
                else {
                    $('#no-activities-span').show();
                }
            },
            sort: { field: 'Name', dir: 'asc'},
            group: { field: 'Type'}
        });
        return {
            beers: beersDataSource
        };
    }());
}());*/