# Back

## The REST API endpoints

Method | URI | Action
--- | --- | ---
GET | http://{hostname}:{port}/api/getEntries?date={date}&owner={owner} | Retrieve list of entries
GET | http://{hostname}:{port}/api/getTodos?owner={owner} | Return todos for this owner
POST | http://{hostname}:{port}/api/postEntry | Add a new entry to date, or update an existing entry
POST | http://{hostname}:{port}/api/deleteEntry | Delete an entry

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
- Sample Call:
    ??? 不会写

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
    - Content: `{ "data" : { "n": 1, "nModified": 0, "ok": 1 } }`
- Error Response:
    - Code: `400`
    - Content: `{ "err" : "Missing param" }`

- Sample Call:
