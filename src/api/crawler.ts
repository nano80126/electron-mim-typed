/* eslint-disable @typescript-eslint/camelcase */
'use strict';

import axios from 'axios';
import cheerio from 'cheerio';
// const cheerio = require('cheerio');

import { ipcMain } from 'electron';
import { IlistCrawled, IlyricsObjCrawled } from '@/types/main-process';

// const axios = require('axios');
// const { ipcMain } = require('electron');

async function listCrawl(artist: string, title: string): Promise<{}> {
	// const att = artist ? encodeURI(artist) : '';
	// const tle = title ? encodeURI(title) : '';
	// const url = `https://utaten.com/lyric/search?sort=&artist_name=${att}&title=${tle}&form_open=0&show_artists=1`;

	const opt = {
		sort: null,
		artist_name: artist,
		title: title,
		form_open: 0,
		show_artists: 1
	};

	const data: { error: Error | null; list: IlistCrawled[] } = {
		error: null,
		list: []
	};
	await axios
		.get('https://utaten.com/lyric/search', { params: opt })
		.then(res => {
			// console.log(res.config.params);

			const $ = cheerio.load(res.data);
			const h2 = $('body div#container > div#contents > main h2.contentBox__title').first(); // first child
			const table = h2.next('div.contentBox__body').children('table');
			const trs = table.children('tbody').children('tr');
			// const trs = contextBody.children('table');
			// console.log($('body div.contentBox__body table tbody').html());

			for (let i = 1; i < trs.length; i++) {
				if (trs.eq(i).children().length >= 2) {
					const eq = trs.eq(i).children('td');
					const eq2 = eq.next();

					// if (eq.children().length > 2) {
					const aTitle = eq.find('> p.searchResult__title > a');
					const aName = eq.find('> p.searchResult__name > a');

					const songTitle = aTitle.text().replace(/^\s+|\s+$/g, '');
					const href = aTitle.attr('href');
					const songSinger = aName.text().replace(/^\s+|\s+$/g, '');
					const lyric = eq2
						.children('a')
						.text()
						.replace(/^\s+|\s+$/g, '');

					// console.log(songTitle, href, songSinger);
					// console.log(lyric);
					data.list.push({
						id: i,
						artist: songSinger,
						title: songTitle,
						lyricsUrl: href || '',
						lyricsFront: lyric
						// expanded: false
					});
				}
			}
		})
		.catch(err => {
			data.error = new Error(err);
		});

	return data;
}

async function lyricsCrawl(subUrl: string): Promise<{}> {
	const url = `https://utaten.com/${subUrl}`;

	const data: { error: Error | null; obj?: IlyricsObjCrawled } = { error: null };

	await axios
		.get(url)
		.then(res => {
			const $ = cheerio.load(res.data);
			const main = $('body div#container > div#contents > main');

			const title = main.find('h1.movieTtl');
			const mainTxt = title
				.children('span.movieTtl_mainTxt')
				.text()
				.replace(/^「|」$/g, '')
				.replace(/\s?\(.*\)$/, '');
			const artist = title
				.children('a.boxArea_artists_move_top')
				.text()
				.replace(/^\s+|\s+$/g, '');

			const lyricBody = main.find('div.lyricBody');
			const lyricContent = lyricBody
				.children('.medium')
				.children('.hiragana')
				.html();

			Object.assign(data, {
				obj: {
					artist: artist,
					title: mainTxt,
					lyricsUrl: subUrl,
					lyricsKey: subUrl.match(/(?<=^\/lyric\/)\w+(?=\/$)/)?.[0],
					lyrics: lyricContent
				}
			});
		})
		.catch(err => {
			data.error = new Error(err);
		});

	return data;
}

ipcMain.on('searchReq', async (e, args) => {
	const { artist, title } = args;
	const ret = await listCrawl(artist, title);
	e.sender.send('searchRes', ret);
});

ipcMain.handle('searchReq', async (e, args) => {
	const { artist, title } = args;
	const ret = await listCrawl(artist, title);
	return ret;
});

ipcMain.on('getLyrics', async (e, args: { url: string; exist: boolean }) => {
	const { url, exist } = args;
	const ret = await lyricsCrawl(url);
	Object.assign(ret, { exist });

	e.sender.send('lyricRes', ret);
});

ipcMain.handle('getLyrics', async (e, args: { url: string; exist: boolean }) => {
	console.log(args);
	const { url, exist } = args;
	const ret = await lyricsCrawl(url);
	Object.assign(ret, { exist });

	return ret;
});

// // Print the full HTML
// console.log(`Site HTML: ${$.html()}\n\n`);

// // Print some specific page content
// console.log(`First h1 tag: ${$('h1').text()}`);
