import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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


let s = ''
let Person = undefined

Persons().then(p => Person = p)

const FlatListBasics = () => {
    const [data, setData] = useState([{key: 'Empty'}]) 
    const [search, setSearch] = useState('')
    let d = []
    function searchInput(str) {
        setSearch(str.toLowerCase())
    }

    useEffect(() => {
        if(Person !== undefined && s !== search){
            console.log('searching...', s, search)
            s = search
            d = Person(search)
            setData(d)
        }
    })

    return (
        <View style={styles.container}>
        <SearchBar
        placeholder="Type Here..."
        onChangeText={(text) => searchInput(text)}
        onClear={(text) => searchInput('')}
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

