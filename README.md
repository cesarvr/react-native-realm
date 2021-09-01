## Agenda - Realm-JS

This is just a sample application showcasing [realm-js](https://github.com/realm/realm-js) embedded database.

## Install

```sh
git clone https://github.com/cesarvr/react-native-realm rn-sample

# install
cd rn-sample && npm install

npx react-native run-ios # or run-android
```


## What it does ?

This app will download and insert a dictionary of names (1.3 MB) into the Realm database, then it will sync this to [MongoDB Realm](https://cloud.mongodb.com/).


# Realm-JS Framework

## Good Parts

#### Fast Queries

![](https://github.com/cesarvr/react-native-realm/blob/master/docs/search.gif?raw=true)

An excellent feature of Realm is that is very fast to query a large number of objects and how the results are provided as simple [Javascript Objects](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics).

To achieve this we just connect the query results to the [FlatListView](https://reactnative.dev/docs/flatlist), similar to this example:

```js

/*
  Schema
  name: 'Dictionary',
  properties: {
      name: 'string',
      status: 'bool'
  }

  Handle realm instantiation...
*/

QueryNames(query) {
  let realm_query = `name BEGINSWITH "${query}"`
  list = realm.objects('Dictionary')

  if(!_.isEmpty(query) )
    list = list.filtered(realm_query)

  return list
}
```
> Setup Realm Query


```js
/* Vars */
const [data, setData] = useState([{name: 'Empty'}])

/* Triggers */
useEffect(()=>{
    let query = async function() {
        let qnames = await QueryNames
        let ret = qnames(search)

        setData(ret)
    }()
},[search])  // Triggers when user start writing a query...

/* Rendering */
<FlatList
data = {data}
renderItem = {
    ({item}) => <Text style={styles.item}>{item.name}</Text>
} />

```
> Setting Up The React Native Component

## Difficult Parts

### Sync

#### Schema Format

To model the data of my app, I wrote the most simple schema supported:

```js
const PersonSchema = {
    name: 'Dictionary',
    properties: {
        name: 'string',
        status: 'bool'
    }
}
```

Once we [configure the Atlas cluster](https://docs.mongodb.com/realm/get-started/create-realm-app/) we find the first obstacle in the form that we need to redefine our schema in another format BSON, which looks like this:

```js
{
  "title": "Dictionary",
  "bsonType": "object",
  "required": [
    "name",
    "status"
  ],
  "properties": {
    "name": {
      "bsonType": "string"
    },
    "status": {
      "bsonType": "boolean"
    }
  }
}

```

> Now we need to maintain two definitions in two different formats, requiring the user to update two places for any change in the future.


#### Unwanted Change


As part of this experiment I try to keep my **local** schema unchanged, but when I tried to save it, we get the following error on Realm *cloud*:

![](https://github.com/cesarvr/react-native-realm/blob/master/docs/sync-error-1.png?raw=true)

This basically tell us that we need to add an ``_id`` to our schema in order to enable ``sync``:

```js
{
  "title": "Dictionary",
  "bsonType": "object",
  "required": [
    "_id",     // new
    "name",
    "status"
  ],
  "properties": {
    "_id": {     // new
      "bsonType": "objectId"
    },
    "name": {
      "bsonType": "string"
    },
    "status": {
      "bsonType": "boolean"
    }
  }
}
```


This seems to mitigate the error in the cloud, but if we execute this locally our app will *crash* via abort signal ([SIGABRT](https://en.wikipedia.org/wiki/Signal_(IPC)#SIGABRT)) showing this error:

>  realm::InvalidAdditiveSchemaChangeException: The following changes cannot be made in additive-only schema mode:
- Primary Key for class 'Dictionary' has been removed.

To fix this we have no choice but to change our local schema to something like this:

```js
const bson = require('bson')

const PersonSchema = {
    name: 'Dictionary',
    properties: {
        name: 'string',
        status: 'bool',
        _id: 'objectId',
    },
    primaryKey: '_id'   // Another change... the impact is higher if you already set a primaryKey.
}
```

Now everything works as expected but with few challenges:
- We need to add a new dependency in the form of [BSON library](https://www.npmjs.com/package/bson).
- We need to add a new field called `_id` and it requires to plan and deploy *migration code* to existing customers.
- A refactor of any ``write`` operations across the codebase.
- Additional pains if you have a pre-existing ``primaryKey`` and more refactor might be necessary here and in the worst case scenario a re-design may be required.



### Writes Are Slow And Blocking

If you stress enough the ``write`` operation it will block. To demo this in the application I wrote a [function that builds a name dictionary](https://github.com/cesarvr/react-native-realm/blob/master/lib/Realm.js#L96-L109) with [164K Registers](https://raw.githubusercontent.com/Debdut/names.io/master/first_names.all.txt) into the database.

```js
/* fetching 164k names... */

/* inserting name's */
realm.write(() => {
  names.forEach(name =>

      realm.create('Dictionary',{
          name,
          status: false
      })

  )
})

/*
  loading: 164433 registers
  time to completion: ≈9s
  performance: 18K registry per second. 

  Machine spec:
  Macbook 16 PCIe SSD.
  disk performance for a raw 1GB write =>
    570949632 bytes (571 MB, 544 MiB) copied, 996 MB/s
*/
```

![](https://github.com/cesarvr/react-native-realm/blob/master/docs/blocking.gif?raw=true)
> In this example the UI is unresponsive to taps.

In conclusion the dictionary weight approximately ``1.3MB`` and somehow my we are hitting some optimization problem that is eating the SSD performance brandwith of `996MB` per second. 

