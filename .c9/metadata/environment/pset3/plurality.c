{"filter":false,"title":"plurality.c","tooltip":"/pset3/plurality.c","ace":{"folds":[],"scrolltop":486.5,"scrollleft":0,"selection":{"start":{"row":104,"column":0},"end":{"row":104,"column":0},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"hash":"1a1b386b5ebaf06958adae46e7464fda9d5a6e92","undoManager":{"mark":0,"position":0,"stack":[[{"start":{"row":0,"column":0},"end":{"row":104,"column":0},"action":"insert","lines":["#include <cs50.h>","#include <stdio.h>","#include <string.h>","","// Max number of candidates","#define MAX 9","","// Candidates have name and vote count","typedef struct","{","    string name;","    int votes;","}","candidate;","","// Array of candidates","candidate candidates[MAX];","","// Number of candidates","int candidate_count;","","// Function prototypes","bool vote(string name);","void print_winner(void);","","int main(int argc, string argv[])","{","    // Check for invalid usage","    if (argc < 2)","    {","        printf(\"Usage: plurality [candidate ...]\\n\");","        return 1;","    }","","    // Populate array of candidates","    candidate_count = argc - 1;","    if (candidate_count > MAX)","    {","        printf(\"Maximum number of candidates is %i\\n\", MAX);","        return 2;","    }","    for (int i = 0; i < candidate_count; i++)","    {","        candidates[i].name = argv[i + 1];","        candidates[i].votes = 0;","    }","","    int voter_count = get_int(\"Number of voters: \");","","    // Loop over all voters","    for (int i = 0; i < voter_count; i++)","    {","        string name = get_string(\"Vote: \");","","        // Check for invalid vote","        if (!vote(name))","        {","            printf(\"Invalid vote.\\n\");","        }","    }","","    // Display winner of election","    print_winner();","}","","// Update vote totals given a new vote","bool vote(string name)","{","    for (int i = 0; i < candidate_count; i++)","    {","        if (strcmp(name,  candidates[i].name) == 0)","        {","            candidates[i].votes++;","            return true;","        }","    }","    return false;","}","","// Print the winner (or winners) of the election","void print_winner(void)","{","    int votesWinner = 0;","","    // stores value of the number of most votes","    for (int i = 0; i < candidate_count; i++)","    {","        if (candidates[i].votes > votesWinner)","        {","            votesWinner = candidates[i].votes;","        }","    }","","    // Prints all candidates that received most votes","    for (int j = 0; j < candidate_count; j++)","    {","        if (candidates[j].votes == votesWinner)","        {","            printf(\"%s\\n\", candidates[j].name);","        }","    }","","    return;","}",""],"id":1}]]},"timestamp":1592304972049}