
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {Persons} from './lib/Realm'
import PureObject from './lib/PureObject'

import { SearchBar, ButtonGroup, Button, Header } from 'react-native-elements';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
});

const db = new PureObject()
let queryEngine = undefined


const DataLoader = {
  Object: async function(){
    console.log('preparing object engine')

    await db.loadDictionary()
    return db.search.bind(db)
  },
  Realm: async function() {
    console.log('preparing realm engine')

    let person = await Persons()
    person = await person
    return person
  }
}


searchEngine = 'Realm'
const Views = ['Realm', 'Object']
const HomeView = ({ navigation }) => {
    const [busy, isBusy] = useState(true)
    const [selectedIndex, setIndex] = useState(0)
    const [disable, isDisable] = useState(false)
    const [data, setData] = useState([{name: 'Empty'}])
    const [search, setSearch] = useState('')

    const [Realm] = useState( async () => await Persons()  )

    function searchInput(str) {
        let query = str.toLowerCase()
        setSearch(query)
        isBusy(true)
    }

    const updateIndex = async (index) => {
      setIndex(index)
      searchEngine = Views[index]
      queryEngine = await DataLoader[searchEngine]()
      setSearch('')
    }

    useEffect(()=>{
        isBusy(true)

        let lookUp = async function(_search) {
            queryEngine = queryEngine || await DataLoader['Realm']()

            let ret = queryEngine(_search)
            setData(ret)
            isBusy(false)
        }(search)

    },[search])

    return (
        <View style={styles.container}>
        <Header
          centerComponent={{ text: 'Database', style: { color: '#fff' } }}
          containerStyle={{
            backgroundColor: '#2f3337',
            justifyContent: 'space-around',
          }}
        />
        <SearchBar
        placeholder="Type Here..."
        disabled={disable}
        onChangeText={(text) => searchInput(text)}
        onClear={(text) => searchInput('')}
        showLoading={busy}
        value={search}
        />
        <ButtonGroup
        onPress={updateIndex}
        selectedIndex={selectedIndex}
        buttons={Views}
        containerStyle={{height: 50}} />
        <FlatList
        data = {data}
        renderItem = {
            ({item}) =>
            <Text style={styles.item}>{item.name}</Text>
        }
        keyExtractor={(item, index) => index.toString()} />
        </View>
    );
}


export default HomeView;
