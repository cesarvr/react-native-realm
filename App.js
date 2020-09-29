import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {Populate, Persons, T, TT} from './lib/Populate'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
});

async function fetchData() {
    console.log('Are we blocking ?')
    await Populate()
    
    let persons = await Persons()
    console.log('....')
    return persons
}

const FlatListBasics = () => {
    const [data, setData] = useState( async () => { 
        let data = await fetchData() 
        setData(data)
    } )

    return (
        <View style={styles.container}>
        <FlatList
        data = {data}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
        />
        </View>
    );
}

export default FlatListBasics;

