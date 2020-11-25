import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {Persons} from './lib/Populate'
import { SearchBar, ButtonGroup } from 'react-native-elements';


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
    const [selectedIndex, setIndex] = useState(0)
    const [disable, isDisable] = useState(false)
    const [data, setData] = useState([{name: 'Empty'}])
    const [search, setSearch] = useState('')

    const [QueryNames] = useState( async () => await Persons()  )

    function searchInput(str) {
        let query = str.toLowerCase()
        setSearch(query)
        isBusy(true)
    }

    const updateIndex = (index) => setIndex(index)

    useEffect(()=>{
        isBusy(true)
        let query = async function() {
            let qnames = await QueryNames
            let ret = qnames(search)

            setData(ret)
            isBusy(false)
        }()
    },[search])

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
        <ButtonGroup
        onPress={updateIndex}
        selectedIndex={selectedIndex}
        buttons={['One', 'Two', 'Three']}
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

export default FlatListBasics;
