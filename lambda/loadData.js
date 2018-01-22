const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var id = event['pathParameters']['id'];
    ddb.get({
      TableName : 'Calculator',
      Key: {
        id: id
      }
    }, (err, data) => {
      if (err) {
        console.log(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({
              Error: err.message
            }),
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
        });
      }
      else {
        console.log(data);
        var response = data.hasOwnProperty('Item') ? data.Item : {};
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
      }
    });
};