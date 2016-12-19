# nsearch

Search for your favorite NBA team's website content via command line interface.

## Installation
nsearch is available on npm.
```bash
$ npm install nsearch -g
```

Alternatively, you can clone this repository:
```bash
$ git clone git://github.com/mkamla/nsearch.git
```

## Usage
```bash
nsearch [team name]
```

You may also simply run the following command:
```bash
nsearch
```
You will then be prompted to supply an NBA team name value

### Team Name
City, Nickname, Value
Atlanta, Hawks, hawks
Boston, Celtics, celtics
Brooklyn, Nets, nets
Charlotte, Hornets, hornets
Chicago, Bulls, bulls
Cleveland, Cavaliers, cavaliers
Dallas, Mavericks, mavericks
Denver, Nuggets, nuggets
Detroit, Pistons, pistons
Golden State, Warriors, warriors
Houston, Rockets, rockets
Indiana, Pacers, pacers
Los Angeles, Clippers, clippers
Los Angeles, Lakers, lakers
Memphis, Grizzlies, grizzlies
Miami, Heat, heat
Milwaukee, Bucks, bucks
Minnesota, Timberwolves, timberwolves
New Orleans, Pelicans, pelicans
New York, Knicks, knicks
Oklahoma City, Thunder, thunder
Orlando, Magic, magic
Philadelphia, 76ers, sixers
Phoenix, Suns, suns
Portland, Trail Blazers, blazers
Sacramento, Kings, kings
San Antonio, Spurs, Spurs
Toronto, Raptors, raptors
Utah, Jazz, jazz
Washington, Wizards, wizards

## Interface

### Search
Search query is located on the line immediately following your initiating command. To return all content, simply press `return` or enter a search query.

### Content Listing
If team content is returned, it will display under the search query. If no content matches your search string, nothing will be rendered.

### Navigation
To navigate the list indices, press `up` or `down` on your keyboard. To open content item in your computer's default browser, navigate to the appropriate index (highlighted in green) and press `return`.

To copy the Node ID, Title or Timestamp, press `left` or `right` on your keyboard and press `c` to copy the desired column value to your computer's clipboard. Note, pressing `return` while selecting a column value will open the item in your default browser.


### Changelog
#### 0.0.2
- Fixed bug on user team prompt