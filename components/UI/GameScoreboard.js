"use client";

import { useEffect, useState } from 'react'

// import axios from 'axios'

import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

// import { useHotkeys } from 'react-hotkeys-hook';

// import ViewUserModal from '@/components/UI/ViewUserModal';
import ViewUserModal from '@articles-media/articles-dev-box/ViewUserModal';

import ArticlesSwitch from '@/components/UI/ArticlesSwitch';
import ArticlesButton from '@/components/UI/Button';
import useGameScoreboard from '@/hooks/useGameScoreboard';

function Page({ game, reloadScoreboard, setReloadScoreboard }) {

    const [showSettings, setShowSettings] = useState(false)

    // const [scoreboard, setScoreboard] = useState([])

    const [visible, setVisible] = useState(false)

    const {
        data: scoreboard,
        isLoading: scoreboardIsLoading,
        mutate: scoreboardMutate
    } = useGameScoreboard({
        game: game
    })

    // function loadScoreboard() {

    //     axios.get('/api/community/games/scoreboard', {
    //         params: {
    //             game: game
    //         }
    //     })
    //         .then(response => {
    //             console.log(response.data)
    //             setScoreboard(response.data)
    //         })
    //         .catch(response => {
    //             console.log(response.data)
    //         })

    // }

    useEffect(() => {

        // loadScoreboard()

    }, [])

    useEffect(() => {

        if (reloadScoreboard) {
            setReloadScoreboard(false)
            // loadScoreboard()
            scoreboardMutate()
        }

    }, [reloadScoreboard])

    return (
        <Box>

            <Dialog open={showSettings} maxWidth="md" fullWidth aria-labelledby="scoreboard-settings-title" onClose={() => setShowSettings(false)}>

                <DialogTitle id="scoreboard-settings-title">Scoreboard Settings</DialogTitle>

                <DialogContent>

                    <FormControlLabel
                        labelPlacement="start"
                        sx={{ display: 'flex', justifyContent: 'space-between', m: 0 }}
                        control={<ArticlesSwitch checked={visible} setChecked={setVisible} />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <EmojiEventsIcon fontSize="small" />
                                <span>Join Scoreboard?</span>
                            </Box>
                        }
                    />

                </DialogContent>

                <DialogActions sx={{ justifyContent: 'space-between' }}>

                    <ArticlesButton
                        variant="articles"
                        onClick={() => {
                            setShowSettings(false)
                        }}
                    >
                        Close
                    </ArticlesButton>

                    {/* It is async */}
                    {/* <ArticlesButton variant="success" onClick={() => {
                        setShowSettings(false)
                    }}>
                        Save
                    </ArticlesButton> */}

                </DialogActions>

            </Dialog>

            <Box sx={{ bgcolor: 'game.card', border: '1px solid', borderColor: 'divider', borderRadius: '0.375rem', mb: '1rem', '@media (min-width: 992px)': { mb: 0 } }}>

                <Box sx={{ p: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>

                    <span>{game} Scoreboard</span>

                    <ArticlesButton
                        aria-label="Refresh scoreboard"
                        onClick={() => {
                            scoreboardMutate()
                        }}
                        small
                    >
                        <RefreshIcon fontSize="small" />
                    </ArticlesButton>

                </Box>

                <Box sx={{ p: 0 }}>

                    {(scoreboard?.length || 0) == 0 &&
                        <Box sx={{ p: '0.5rem', fontSize: '0.875em' }}>No scores yet</Box>
                    }

                    {scoreboard?.map((doc, i) =>
                        <Box key={doc._id} sx={{ p: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', lineHeight: 1.25 }}>

                                <Box sx={{ display: 'flex' }}>

                                    <Typography variant="h5" sx={{ m: 0, mr: '1rem', fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.2 }}>{i + 1}</Typography>

                                    <Box sx={{ lineHeight: 1.25 }}>

                                        <ViewUserModal
                                            populated_user={doc.populated_user}
                                            user_id={doc.user_id}
                                        />

                                    </Box>

                                </Box>

                                <Box><Typography variant="h5" sx={{ m: 0, fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.2 }}>{doc.score || doc.total}</Typography></Box>

                            </Box>

                            {(doc.last_play && doc.public_last_play) && <Box component="small" sx={{ mt: '0.25rem', fontSize: '0.75rem' }}>Played: {format(new Date(doc.last_play), 'MM/d/yy hh:mmaa')}</Box>}

                        </Box>
                    )}

                </Box>

                <Box sx={{ p: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>

                    <Box sx={{ fontSize: '0.875em' }}>Play to get on the board!</Box>

                    <ArticlesButton
                        aria-label="Scoreboard settings"
                        small
                        onClick={() => {
                            setShowSettings(true)
                        }}
                    >
                        <SettingsIcon fontSize="small" />
                    </ArticlesButton>

                </Box>

            </Box>

        </Box>
    )
}

export default Page;
