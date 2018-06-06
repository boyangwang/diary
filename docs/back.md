# Back

## The REST API endpoints

Method | URI | Action
--- | --- | ---
GET | https://{hostname}:{port}/api/getEntries?date={date}&owner={owner} | Retrieve list of entries
POST | https://{hostname}:{port}/api/postEntry | Add a new entry to date, or update an existing entry
POST | https://{hostname}:{port}/api/deleteEntry | Delete an entry
GET | https://{hostname}:{port}/api/getTodos?owner={owner} | Return todos for this owner
POST | https://{hostname}:{port}/api/postTodo | Add a new todo to date, or update an existing todo
POST | https://{hostname}:{port}/api/deleteTodo | Delete a todo
POST | https://{hostname}:{port}/api/login | Perform login authentication
POST | https://{hostname}:{port}/api/errReport | Report error entry

**Note:**  
`{some}` represnets a variable called "some"

Example for an `{entry}` object that will be used in the following
```json
{
  "date": "1970-01-01",
  "title": "test title",
  "content": "test content",
  "points": 1,
  "_id": "5aae5d46c53c46492ce1086a"
}
```

Example for an `{todo}` object that will be used in the following
```json
{
  "date": "1970-01-01",
  "title": "test title",
  "content": "test content",
  "priority": 3,
  "check": "false",
  "_id": "5aae5d46c53c46492ce1086a"
}
```

Example for an `{reminder}` object that will be used in the following
```json
{
  "createTimestamp": 1521819342901,
  "title": "test title",
  "content": "<p>test</p>",
  "_id": "5aae5d46c53c46492ce1086a",
  "cycleType": "year",
  "cycleTime": "01-01", // 12-31
  // "month": "month_1" "month_30" "month_31" "month_-1"
  // "week": "week_1" "week_7"
}
```

Example for an `{digest}` object that will be used in the following
```json
{
  "createTimestamp": 1521819342901,
  "lastModified": 1521819342901,
  "title": "test title",
  "content": "<p>test</p>",
  "tags": ["tag1", "tag2", "tag3"],
  "_id": "5aae5d46c53c46492ce1086a",
}
```

## Document for each REST API

### getEntries
Returns a list of entries for specified date, or empty

- URL: /api/getEntries?date={date}&owner={owner}

- Method: `GET`

- URL Params
    - Required: `date=/^\d{4}-\d{2}-\d{2}$/`
    - Required: `owner=/^[A-Za-z0-9]+$/`

- Data Params None

- Success Response:
    - Code: 200 
    - Content: `{ "data" : {entry} }`
- Error Response:
    - Code: `400`
    - Content: `{ "err" : "Missing param" }`
    
    OR

    - Code: `400`
    - Content: `{ "err" : "Illegal param" }`


### postEntry
Adds a new entry to date, or update an existing entry

- URL: /api/postEntry

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `owner=/^[A-Za-z0-9]+$/`
    - Required: `date=/^\d{4}-\d{2}-\d{2}$/`
    - Required: `title=[string]`
    - Required: `content=[string]`
    - Required: `points=[integer]`
    - Optional: `_id`

- Success Response:
    - Code: 200 
    - Content: `{ "data" : { {entry} } }`
    
    OR
    
    - Code: 200
    - Content: `{ "data" : { "n": 1, "nModified": 1, "ok": 1 } }`
    
    OR
    
    - Code: 200
    - Content: `{ "data" : { "n": 1, "nModified": 0, "ok": 1 } }`
- Error Response:
    - Code: `400`
    - Content: `{ "err" : "Missing param" }`


### deleteEntry
Deletes an existing entry

- URL: /api/deleteEntry

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `owner=/^[A-Za-z0-9]+$/`
    - Required: `entry={ _id: {id} }`

- Success Response:
    - Code: 200 
    - Content: `{ "data" : { {entry} } }`


### getTodos
Returns todos for this owner

- URL: /api/getTodos?date={date}&owner={owner}

- Method: `GET`

- URL Params
    - Required: `date=/^\d{4}-\d{2}-\d{2}$/`
    - Required: `owner=/^[A-Za-z0-9]+$/`

- Data Params None

- Success Response:
    - Code: 200 
    - Content: `{ "data" : {todo} }`
- Error Response:
    - Code: `400`
    - Content: `{ "err" : "Missing param" }`
    
    OR

    - Code: `400`
    - Content: `{ "err" : "Illegal param" }`


### postTodo
Adds a new todo to date, or update an existing todo

- URL: /api/postTodo

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `owner=/^[A-Za-z0-9]+$/`
    - Required: `todo`

- Success Response:
    - Code: 200 
    - Content: `{ "data" : { {todo} } }`
    
    OR
    
    - Code: 200
    - Content: `{ "data" : { "n": 0, "nModified": 0, "ok": 1 } }`
    
    OR
    
    - Code: 200
    - Content: `{ "data" : { "n": 1, "nModified": 1, "ok": 1 } }`
- Error Response:
    - Code: `400`
    - Content: `{ "err" : "Missing param" }`
    
    
### deleteTodo
Deletes an existing todo

- URL: /api/deleteTodo

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `owner=/^[A-Za-z0-9]+$/`
    - Required: `entry={ _id: {id} }`

- Success Response:
    - Code: 200 
    - Content: `{ "data" : { {todo} } }`


### login
Performs login authentication

- URL: /api/login

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `username=[string]`
    - Required: `password=[string]`

- Success Response:
    - Code: 200 
    - Content: `{ "data" : { "user": { "username": "xxx" } } }`
    
- Error Response:
    - Code: `401`
    - Content: `{ "err" : "Login failure" }`
    
    OR 
    - Code: `401`
    - Content: `{ "err" : "need login" }`


### errReport
Reports error entry

- URL: /api/errReport

- Method: `POST`

- URL Params None

- Data Params 
    - Required: `_id=[string]`
    - Required: `err=[string]`

- Success Response:
    - Code: 200 
    - Content: `{ "err" : { "_id": "testid", "err": "test" } }`
