import supabase from '../lib/supabase'

export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log("🔄 Starting migration to Supabase...")
    
    // Test Supabase connection first
    const { data: connectionTest, error: connectionError } = await supabase
      .from('fixtures_rugby12345')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error("❌ Supabase connection test failed:", connectionError)
      throw new Error(`Supabase connection error: ${connectionError.message}`)
    }
    
    console.log("✅ Supabase connection verified")
    
    // Get all localStorage data
    const fixtures = JSON.parse(localStorage.getItem('rugbyFixtures') || '[]')
    const results = JSON.parse(localStorage.getItem('rugbyResults') || '[]')
    const players = JSON.parse(localStorage.getItem('rugbyPlayers') || '[]')
    const media = JSON.parse(localStorage.getItem('rugbyMedia') || '[]')
    
    console.log(`📊 Found ${fixtures.length} fixtures, ${results.length} results, ${players.length} players, ${media.length} media items`)
    
    // Clear existing data to avoid conflicts
    console.log("🗑️ Clearing existing Supabase data...")
    await supabase.from('fixtures_rugby12345').delete().neq('id', 0)
    await supabase.from('results_rugby12345').delete().neq('id', 0)
    await supabase.from('players_rugby12345').delete().neq('id', 0)
    await supabase.from('media_rugby12345').delete().neq('id', 0)
    
    // Migrate fixtures
    if (fixtures.length > 0) {
      console.log("📅 Migrating fixtures...")
      const transformedFixtures = fixtures.map(f => ({
        id: f.id,
        opponent: f.opponent,
        date: f.date,
        time: f.time,
        venue: f.venue,
        home_away: f.homeAway,
        competition: f.competition || 'Medallion Shield'
      }))
      
      const { error: fixturesError } = await supabase
        .from('fixtures_rugby12345')
        .insert(transformedFixtures)
        
      if (fixturesError) {
        console.error("❌ Fixtures migration error:", fixturesError)
        throw fixturesError
      }
      console.log("✅ Fixtures migrated successfully")
    }
    
    // Migrate results
    if (results.length > 0) {
      console.log("🏆 Migrating results...")
      const transformedResults = results.map(r => ({
        id: r.id,
        opponent: r.opponent,
        date: r.date,
        venue: r.venue,
        home_away: r.homeAway,
        sullivan_score: r.sullivanScore,
        opponent_score: r.opponentScore,
        match_type: r.matchType || '',
        notes: r.notes || ''
      }))
      
      const { error: resultsError } = await supabase
        .from('results_rugby12345')
        .insert(transformedResults)
        
      if (resultsError) {
        console.error("❌ Results migration error:", resultsError)
        throw resultsError
      }
      console.log("✅ Results migrated successfully")
    }
    
    // Migrate players
    if (players.length > 0) {
      console.log("👥 Migrating players...")
      const transformedPlayers = players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        number: p.number,
        age: p.age,
        height: p.height || '',
        weight: p.weight || '',
        photo: p.photo || '',
        captain: p.captain || false,
        stats: p.stats || { tries: 0, conversions: 0, penalties: 0 }
      }))
      
      const { error: playersError } = await supabase
        .from('players_rugby12345')
        .insert(transformedPlayers)
        
      if (playersError) {
        console.error("❌ Players migration error:", playersError)
        throw playersError
      }
      console.log("✅ Players migrated successfully")
    }
    
    // Migrate media
    if (media.length > 0) {
      console.log("📸 Migrating media...")
      const transformedMedia = media.map(m => ({
        id: m.id,
        type: m.type,
        url: m.url,
        title: m.title,
        description: m.description || '',
        date: m.date,
        tags: m.tags || []
      }))
      
      const { error: mediaError } = await supabase
        .from('media_rugby12345')
        .insert(transformedMedia)
        
      if (mediaError) {
        console.error("❌ Media migration error:", mediaError)
        throw mediaError
      }
      console.log("✅ Media migrated successfully")
    }
    
    console.log('🎉 Migration completed successfully!')
    return true
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    return false
  }
}