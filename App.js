import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {Persons} from './lib/Populate'
import { SearchBar } from 'react-native-elements';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 52
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
});

const FlatListBasics = () => {
    const [busy, isBusy] = useState(true)
    const [disable, isDisable] = useState(false)
    const [data, setData] = useState([{key: 'Empty'}])
    const [search, setSearch] = useState('')

    const [person] = useState(async () => Persons())

    console.log('once ?')

    function searchInput(str) {
        let query = str.toLowerCase()
        setSearch(query)
        isBusy(true)
    }

    useEffect(()=>{
      // person.then(db => {
      //   console.log('wtf -> ', Array.isArray(db), typeof db)
      //   let d = db('cesar')
      //   console.log('d', d)
      //   return [{key: 'Empty'}]
      // })
      // .then(data => setData(data))

      console.log('[search] person: ', person)

    },[search])

    useEffect(() => {
      console.log('[] person: ', person)
    },[])

    return (
        <View style={styles.container}>
        <SearchBar
        placeholder="Type Here..."
        disabled={disable}
        onChangeText={(text) => searchInput(text)}
        onClear={(text) => searchInput('')}
        showLoading={busy}
        value={search}
        />
        <FlatList
        data = {data}
        renderItem = {
            ({item}) =>
            <Text style={styles.item}>{item.key}</Text>
        }
        />
        </View>
    );
}

export default FlatListBasics;
