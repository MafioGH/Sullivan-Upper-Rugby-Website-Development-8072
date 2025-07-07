import supabase from '../lib/supabase'

export const migrateLocalStorageToSupabase = async () => {
  try {
    // Get all localStorage data
    const fixtures = JSON.parse(localStorage.getItem('rugbyFixtures') || '[]')
    const results = JSON.parse(localStorage.getItem('rugbyResults') || '[]')
    const players = JSON.parse(localStorage.getItem('rugbyPlayers') || '[]')
    const media = JSON.parse(localStorage.getItem('rugbyMedia') || '[]')
    const stats = JSON.parse(localStorage.getItem('rugbyStats') || '{}')

    // Migrate fixtures
    if (fixtures.length > 0) {
      const { error: fixturesError } = await supabase
        .from('fixtures')
        .insert(fixtures.map(f => ({
          opponent: f.opponent,
          date: f.date,
          time: f.time,
          venue: f.venue,
          home_away: f.homeAway,
          competition: f.competition
        })))
      
      if (fixturesError) throw fixturesError
    }

    // Migrate results
    if (results.length > 0) {
      const { error: resultsError } = await supabase
        .from('results')
        .insert(results.map(r => ({
          opponent: r.opponent,
          date: r.date,
          venue: r.venue,
          home_away: r.homeAway,
          sullivan_score: r.sullivanScore,
          opponent_score: r.opponentScore,
          match_type: r.matchType,
          notes: r.notes
        })))
      
      if (resultsError) throw resultsError
    }

    // Migrate players
    if (players.length > 0) {
      const { error: playersError } = await supabase
        .from('players')
        .insert(players.map(p => ({
          name: p.name,
          position: p.position,
          number: p.number,
          age: p.age,
          height: p.height,
          weight: p.weight,
          photo: p.photo,
          captain: p.captain,
          stats: p.stats
        })))
      
      if (playersError) throw playersError
    }

    // Migrate media
    if (media.length > 0) {
      const { error: mediaError } = await supabase
        .from('media')
        .insert(media.map(m => ({
          type: m.type,
          url: m.url,
          title: m.title,
          description: m.description,
          date: m.date,
          tags: m.tags
        })))
      
      if (mediaError) throw mediaError
    }

    // Migrate stats
    if (Object.keys(stats).length > 0) {
      const { error: statsError } = await supabase
        .from('stats')
        .insert([{
          games_played: stats.gamesPlayed,
          wins: stats.wins,
          points_for: stats.pointsFor,
          points_against: stats.pointsAgainst
        }])
      
      if (statsError) throw statsError
    }

    console.log('Migration completed successfully!')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}