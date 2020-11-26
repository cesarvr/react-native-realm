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

## Bad Parts

### Sync Is Hard  







### Writes Are Slow And Blocking

If you stress enough the ``write`` operation it will block. To demo this in the application I wrote a [function that builds a name dictionary](https://github.com/cesarvr/react-native-realm/blob/master/lib/Populate.js#L102-L125) with [164K Registers](https://raw.githubusercontent.com/philipperemy/name-dataset/master/names_dataset/first_names.all.txt) into the database.

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
  current speed: time it took to store: 9-8s

  Machine spec:
  disk type => Macbook 16 PCIe SSD.
  disk performance for 1GB write =>
    570949632 bytes (571 MB, 544 MiB) copied, 996 MB/s
*/
```

![](https://github.com/cesarvr/react-native-realm/blob/master/docs/blocking.gif?raw=true)
> In this example the UI is unresponsive to taps.
