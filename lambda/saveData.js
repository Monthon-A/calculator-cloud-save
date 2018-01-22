const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (e) {
      callback(null, {
          statusCode: 405,
          body: JSON.stringify({
            Error: e.message
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
      });
      return;
    }
    if (requestBody == null || requestBody.id == null) {
      callback(null, {
        statusCode: 405,
        body: JSON.stringify({
          Error: "Invalid input"
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
      return;
    }
    var item = {
      id: requestBody.id,
      a: requestBody.a,
      b: requestBody.b,
      op: requestBody.op,
      result: requestBody.result
    }
    ddb.put({
        TableName: 'Calculator',
        Item: requestBody
    }, function(err, data) {
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
        console.log("Save data with id: " + requestBody.id);
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                status: "success"
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
      }
    });
};