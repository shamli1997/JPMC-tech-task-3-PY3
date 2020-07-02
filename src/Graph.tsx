import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
//import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float'
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view','y_line');
      elem.setAttribute('row-pivots','["timestamp"]');
      elem.setAttribute('columns','["ratio","lower_bound","upper_bound","trigger_alert"]');
      elem.setAttribute('aggregates',JSON.stringify({
      price_abc: 'avg',
      price_def: 'avg',
      ratio:'avg',
      timestamp: 'distinct count',
      upper_bound:'avg',
      lower_bound:'avg',
      }));
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      // this.table.update(this.props.data.map((el: any) => {
      //   // Format the data from ServerRespond to the schema
      //   return {
      //     stock: el.stock,
      //     top_ask_price: el.top_ask && el.top_ask.price || 0,
      //     top_bid_price: el.top_bid && el.top_bid.price || 0,
      //     timestamp: el.timestamp,
      //   };
      // }));
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
