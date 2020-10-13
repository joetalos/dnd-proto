"use strict";

import { api } from 'lwc';

export const TYPE_GAP = 'GAP';
export const TYPE_QUESTION = 'QUESTION';

export default class GroupContentItem {
    
    // type of item: GAP or QUESTION
    @api type;
    @api number;
    // gap: { gap# }
    // question: {}
    @api item;

    constructor(type, item) {
        this.type = type;
        this.item = item;
    }

}