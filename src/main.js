'use strict'

var PouchDB = require('pouchdb').plugin(require('relational-pouch'))
var db = new PouchDB('tests')

var EditionSchema = {
	singular: 'edition',
	plural: 'editions',
	relations: {
		chapters: { hasMany: 'chapter' },
		media: { hasMany: 'media' }
	}	
}

var ChapterSchema = {
	singular: 'chapter',
	plural: 'chapters',
	relations: {
		sequences: { hasMany: 'sequence' }
	}
}

var SequenceSchema = {
	singular: 'sequence',
	plural: 'sequences',
	relations: {
		stage: { belongsTo: 'asset' },
		next: { belongsTo: 'sequence' }
	}
}

var MediaSchema = {
	singular: 'media',
	plural: 'media',
	relations: {
		edition: { belongsTo: 'edition' }
	}
}

var AssetSchema = {
	singular: 'asset',
	plural: 'assets',
	relations: {
		media: { belongsTo: 'media' },
		parent: { belongsTo: 'asset' },
		children: { hasMany: 'asset' }
	}
}

db.setSchema([
	EditionSchema,
	ChapterSchema,
	SequenceSchema,
	MediaSchema,
	AssetSchema
])

async function Media (props) {
	return (await db.rel.save('media', {
		id: props.id,
		src: props.src || '',
	})).media[0]
}

async function Asset (props) {
	var a = (await db.rel.save('asset', {
		id: props.id,
		media: props.media,
		parent: props.parent,
		children: props.children || []
	})).assets[0]

	if (props.parent) {
		var p = (await db.rel.find('asset', props.parent)).assets[0]

		p.children.push(a.id)
		var updatedP = (await db.rel.save('asset', p)).assets[0]
	}
	return a
}

async function setup () {
	var m1 = await Media({			
		src: 'assets/sun.png'	
	})
	var root = await Asset({
		media: m1.id,
	})
	var a1 = await Asset({
		media: m1.id,
		parent: root.id,
	})
	var assets = await db.rel.find('assets')

	console.log(assets)
}

setup()
window.db = db
