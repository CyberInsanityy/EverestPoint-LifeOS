/* EverestPoint Life OS | local-only runtime */
(function () {
  "use strict";

  var App = {
    state: {
      searchTerm: "",
      activeDecision: null,
      lastExerciseInput: null
    },
    el: {}
  };

  var Storage = (function () {
    var KEY = "everestpoint-life-os";

    function uid(prefix) {
      return prefix + "-" + Math.random().toString(36).slice(2, 10);
    }

    function defaults() {
      return {
        profile: {
          name: "EverestPoint Life OS",
          focus: "Create a calmer weekly rhythm",
          energy: "7/10",
          city: "Atlanta",
          currentSeason: "Reset and rebuild",
          northStar: "Run life with more calm, structure, and follow-through"
        },
        reset: null,
        routines: [
          { id: uid("routine"), title: "Morning reset", category: "Focus", frequency: "Daily", why: "Starts the day with less drift." },
          { id: uid("routine"), title: "Evening tidy", category: "Home", frequency: "Daily", why: "Keeps the home from feeling heavy." }
        ],
        admin: [
          { id: uid("admin"), title: "Renew car insurance", area: "Money", dueDate: "2026-04-04", notes: "Compare prices before renewing.", done: false }
        ],
        checkins: [
          { id: uid("checkin"), mood: "Hopeful", energy: "Medium", season: "Rebuilding", note: "I want calmer structure, not more pressure.", createdAt: new Date().toISOString() }
        ],
        areas: [
          { id: uid("area"), area: "Home", status: "Messy but manageable", note: "A cleaner room would help everything else feel lighter." }
        ],
        decisions: [],
        exercises: [],
        paths: [],
        challenges: [],
        resetKits: [],
        games: [],
        wins: [
          { id: uid("win"), title: "I started building a calmer system", area: "Mindset", note: "Even naming what I need counts.", createdAt: new Date().toISOString() }
        ],
        timeline: [
          { id: uid("timeline"), title: "Started Life OS reset", date: "2026-03-26", notes: "Built a clearer life system instead of reacting every day." }
        ],
        seasonTimeline: [
          { id: uid("season"), season: "Rebuilding", date: "2026-03-26", notes: "I started wanting structure that actually holds." }
        ],
        playbooks: [
          { id: uid("playbook"), title: "Sunday reset", trigger: "When the week feels scattered", steps: ["Clear open tabs and inboxes", "Review life admin", "Pick top 3 priorities", "Reset kitchen and bedroom"] }
        ],
        letters: [],
        journal: [
          { id: uid("journal"), title: "Starting cleaner", mood: "Hopeful", entry: "I want a life system that makes me feel more stable instead of always catching up.", createdAt: new Date().toISOString() }
        ],
        vault: []
      };
    }

    function read() {
      var raw = localStorage.getItem(KEY);
      if (!raw) return write(defaults());
      try {
        return Object.assign(defaults(), JSON.parse(raw));
      } catch (error) {
        return write(defaults());
      }
    }

    function write(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    }

    function update(updater) {
      var store = read();
      updater(store);
      return write(store);
    }

    return {
      read: read,
      update: update,
      uid: uid
    };
  })();

  var Engine = (function () {
    var seasonDefinitions = {
      rebuilding: { label: "Rebuilding", description: "You are putting life back into shape after drift, stress, or a hard stretch. This season needs structure, gentleness, and follow-through." },
      recovery: { label: "Recovery", description: "You are carrying less pressure on purpose so your energy, body, and mind can come back online. This season needs softness, not overcorrection." },
      transition: { label: "Transition", description: "Something is changing, even if the next chapter is not fully clear yet. This season needs reflection, patience, and better choices." },
      growth: { label: "Growth", description: "You are ready to stretch, expand, and ask more from life. This season needs boldness, consistency, and proof that you can handle more." },
      stabilizing: { label: "Stabilizing", description: "You want life to stop feeling so reactive. This season needs routines, fewer loose ends, and repeatable calm." },
      heavy: { label: "Heavy", description: "You are carrying more than usual emotionally or practically. This season needs relief, honesty, and less invisible weight." }
    };

    var exerciseBank = {
      "Mental clarity": [
        { title: "What is actually bothering me?", note: "Use this when your mind feels loud but you cannot quite name what is wrong.", prompts: ["The thing taking up the most space in my mind right now is ___.", "The part that hurts most is ___.", "If I am completely honest, the real issue underneath this is ___.", "What I need to admit to myself is ___."], action: "Circle the sentence that feels most true and let that be your focus today." },
        { title: "Control / Influence / Release", note: "Use this when anxiety is mixing together things you can handle and things you cannot.", prompts: ["What I can directly control today is ___.", "What I can influence but not force is ___.", "What I need to release for now is ___.", "If I stop carrying everything at once, the next right step is ___."], action: "Take one action from the control list in the next hour." },
        { title: "Fear vs Fact", note: "Use this when your mind is making a situation feel bigger than it currently is.", prompts: ["The fear story in my head says ___.", "What I actually know for sure is ___.", "What I am assuming without proof is ___.", "The calmer interpretation might be ___."], action: "Rewrite the situation using only facts." },
        { title: "Mental clutter release", note: "Use this when your thoughts feel crowded and it is hard to focus.", prompts: ["Three things taking up too much space in my head are ___.", "One thing I can leave for later is ___.", "One thing I need to act on now is ___.", "One thing I can stop replaying tonight is ___."], action: "Pick one thing to postpone and one thing to handle today." }
      ],
      "Weekly reset": [
        { title: "Close the week", note: "Use this before a new week starts so you do not carry invisible weight forward.", prompts: ["What felt unfinished this week was ___.", "What drained more energy than it should have was ___.", "What I handled better than usual was ___.", "Next week will feel lighter if I ___."], action: "Choose one unfinished thing to fully close." },
        { title: "What I need to stop tolerating", note: "Use this when the same friction keeps repeating.", prompts: ["I keep tolerating ___.", "It affects my mood by ___.", "The boundary or system I probably need is ___.", "The smallest version of that change is ___."], action: "Turn one repeated frustration into one clear boundary or system." },
        { title: "Reset my environment", note: "Use this when your space is making your mind feel noisier.", prompts: ["The part of my space that affects my mood most is ___.", "I keep avoiding it because ___.", "The 15-minute version of resetting it would be ___.", "I know I will feel better once ___."], action: "Start with the smallest reset that you can see right away." }
      ],
      "Decision making": [
        { title: "If I had to decide in 24 hours", note: "Use this when you need to stop circling and get honest.", prompts: ["If I had to decide in the next 24 hours, I would probably choose ___.", "The main reason I hesitate is ___.", "What I am afraid this choice might say about me is ___.", "My future self might thank me for ___."], action: "Write down the option you already feel yourself leaning toward." },
        { title: "What am I pretending not to know?", note: "Use this when you suspect you already know the truth but keep delaying it.", prompts: ["The truth I keep circling around is ___.", "I delay deciding because ___.", "The cost of staying undecided is ___.", "If I trusted myself more, I would ___."], action: "Name the hidden truth in one clean sentence." },
        { title: "Best friend test", note: "Use this when you need perspective outside your own spiral.", prompts: ["If my best friend came to me with this exact decision, I would tell them ___.", "The clearest red flag here is ___.", "The clearest green flag here is ___.", "Why is it easier to be clear for someone else than for myself?"], action: "Read your own advice back as if it were meant for you too." }
      ],
      "Self-awareness": [
        { title: "I feel most like myself when", note: "Use this when you feel disconnected from your own identity.", prompts: ["I feel most like myself when ___.", "I lose that feeling when ___.", "The people or environments that pull me back to myself are ___.", "I need more of ___ in my normal life."], action: "Schedule one thing this week that reconnects you to yourself." },
        { title: "What drains me / what restores me", note: "Use this when you keep losing energy and cannot quite explain why.", prompts: ["I feel drained after ___.", "I feel restored after ___.", "Something I keep doing that quietly wears me out is ___.", "One shift that would protect my energy is ___."], action: "Protect one restoring habit this week." },
        { title: "Where I keep getting in my own way", note: "Use this when patterns are repeating and you want honesty instead of self-judgment.", prompts: ["A pattern I keep repeating is ___.", "I think I do it because ___.", "What it helps me avoid is ___.", "A healthier replacement pattern could be ___."], action: "Pick one replacement behavior before the pattern shows up again." }
      ],
      "Routine repair": [
        { title: "Why this habit keeps failing", note: "Use this when a routine sounds good in theory but never sticks in real life.", prompts: ["The routine I keep failing at is ___.", "It usually breaks when ___.", "The hidden friction is ___.", "The smallest version I could actually keep is ___."], action: "Shrink the routine until it feels almost too easy." },
        { title: "Fallback version for low-energy days", note: "Use this when perfection is breaking consistency.", prompts: ["The ideal version of this routine is ___.", "The low-energy version could be ___.", "The point of keeping it alive is ___.", "What counts as enough on a bad day is ___."], action: "Define what success looks like on your worst day, not your best one." },
        { title: "Routine friction audit", note: "Use this when your environment is making a good habit harder than it needs to be.", prompts: ["Something in my environment makes this harder because ___.", "The cue I need before this routine is ___.", "The reward after this routine could be ___.", "The system change that would help most is ___."], action: "Fix one piece of friction in your environment today." }
      ],
      "Relationships": [
        { title: "A conversation I am avoiding", note: "Use this when tension grows because you keep putting a conversation off.", prompts: ["The conversation I am avoiding is ___.", "I am avoiding it because ___.", "What I actually need to communicate is ___.", "The kindest honest version of that might sound like ___."], action: "Draft one honest sentence you could actually say." },
        { title: "Who I need to reach for", note: "Use this when you feel isolated or disconnected from support.", prompts: ["Someone I keep thinking about is ___.", "What stops me from reaching out is ___.", "If our roles were reversed, I would want someone to say ___.", "The easiest way to check in would be ___."], action: "Send a simple message instead of waiting for the perfect one." },
        { title: "What I need more clearly", note: "Use this when resentment or loneliness is building.", prompts: ["Lately I have needed more ___.", "I do not always ask for it because ___.", "The cost of staying silent is ___.", "A clearer request would be ___."], action: "Turn one vague need into a clean request." }
      ],
      "Life direction": [
        { title: "What season am I in?", note: "Use this when life feels different and you need language for the chapter you are living through.", prompts: ["The season I am in feels like ___.", "I think this season is trying to teach me ___.", "What is ending is ___.", "What wants to begin is ___."], action: "Name your season in three words." },
        { title: "What is no longer working", note: "Use this when your life looks normal on paper but something feels off.", prompts: ["Something that no longer fits is ___.", "I keep trying to force it because ___.", "The sign it is not working anymore is ___.", "What I may need to move toward instead is ___."], action: "Identify one thing that needs a redesign, not more effort." },
        { title: "What success actually looks like for me", note: "Use this when you feel yourself chasing someone else’s version of success.", prompts: ["Success has often been defined for me as ___.", "What I actually want more of is ___.", "The kind of life I would truly feel proud of is ___.", "To move toward that, I need to start ___ and stop ___."], action: "Replace one borrowed goal with one personal one." }
      ],
      "Low-energy support": [
        { title: "Bad day reset", note: "Use this when everything feels heavier than usual and you need gentleness with structure.", prompts: ["Today feels hard because ___.", "What I need least right now is ___.", "What would help me feel 10% safer or calmer is ___.", "The smallest caring thing I can do for myself is ___."], action: "Do one thing that lowers pressure instead of raising expectations." },
        { title: "When I feel behind", note: "Use this when guilt and backlog are making it hard to start anything.", prompts: ["I feel behind on ___.", "What I am making this mean about me is ___.", "What is actually urgent is ___.", "The smallest catch-up move is ___."], action: "Forget catching up on everything. Catch up on one thing." },
        { title: "Overwhelm reset", note: "Use this when your nervous system feels overloaded.", prompts: ["Everything feels like too much because ___.", "The first thing to stop feeding right now is ___.", "The one thing that matters most in the next three hours is ___.", "The one thing I can intentionally postpone is ___."], action: "Reduce inputs before increasing effort." }
      ],
      "Poem reflection": [
        { title: "Poem for tired days", note: "Use this when you want a softer reflection instead of jumping straight into problem-solving.", poemText: "You are not late to your own life.\nSome days are for carrying less.\nSome days are for lighting one small lamp\nand calling that enough for now.", prompts: ["The line that stands out most to me is ___.", "This poem makes me feel ___.", "The part that feels true in my life right now is ___.", "One way I could apply this to today is ___."], action: "Take one line from the poem and let it lower the pressure you are putting on today." },
        { title: "Poem for rebuilding", note: "Use this when you want motivation that still feels grounded and honest.", poemText: "Brick by brick is still a way forward.\nQuiet progress is still progress.\nA steadier life is built in ordinary moments,\nnot only in dramatic turning points.", prompts: ["The most motivating line here is ___.", "What this poem wakes up in me is ___.", "The part of my life that needs this message is ___.", "One ordinary action that would match this poem is ___."], action: "Choose one ordinary action that proves you are still building something real." },
        { title: "Poem for heavy seasons", note: "Use this when you want language for sadness, grief, or emotional weight without forcing yourself to explain everything directly.", poemText: "Some seasons ask for gentleness first.\nNot every quiet day is failure.\nNot every heavy hour means you are lost.\nSometimes staying with yourself is the brave thing.", prompts: ["The saddest or truest line here feels like ___.", "This poem makes me notice ___.", "The part of my season it speaks to is ___.", "One kind thing I could do after reading this is ___."], action: "Let the poem soften your self-talk before you ask yourself for more effort." }
      ]
    };
    var challengeBlueprints = {
      "7-Day Mental Reset": {
        count: 7,
        description: "A shorter reset path for when your mind feels loud and you need order without pressure.",
        whatItBuilds: "mental clarity, lower internal noise, and a calmer next step",
        themes: ["thoughts", "inputs", "truth", "environment", "release", "support", "next week"],
        stems: [
          "Do a {paceWord} reset around {theme}.",
          "Name what feels heaviest about {theme} and reduce one layer of pressure.",
          "Turn {theme} into one honest page instead of a vague fog.",
          "Give yourself a {paceWord} checkpoint for {theme}."
        ]
      },
      "14-Day Routine Rebuild": {
        count: 14,
        description: "A longer system rebuild for when life needs rhythms that actually fit your real energy.",
        whatItBuilds: "consistency, repeatable routines, and lower-friction structure",
        themes: ["morning rhythm", "evening rhythm", "food basics", "movement", "screen limits", "sleep support", "environment", "follow-through", "fallback plans", "tracking", "energy cues", "repetition", "identity", "review"],
        stems: [
          "Create a {paceWord} system for {theme}.",
          "Shrink {theme} until it fits real life, not ideal life.",
          "Audit the friction around {theme} and remove one barrier.",
          "Rebuild {theme} with cues, a minimum version, and one visible win."
        ]
      },
      "7-Day Self-Trust Reset": {
        count: 7,
        description: "A guided week for rebuilding trust in your own voice, choices, and follow-through.",
        whatItBuilds: "self-trust, cleaner boundaries, and more honest action",
        themes: ["honesty", "promises", "boundaries", "choice-making", "body signals", "follow-through", "identity"],
        stems: [
          "Practice a {paceWord} act of self-trust around {theme}.",
          "Use {theme} to prove to yourself that you can follow your own lead.",
          "Turn {theme} into one decision you stop outsourcing.",
          "Build a stronger relationship with yourself through {theme}."
        ]
      },
      "Clean Slate Week": {
        count: 7,
        description: "A visible reset for when life feels cluttered, delayed, or mentally sticky.",
        whatItBuilds: "momentum, lighter surroundings, and cleaner mental space",
        themes: ["room reset", "schedule reset", "digital cleanup", "open loops", "meals and basics", "relationship tension", "next week plan"],
        stems: [
          "Run a {paceWord} clean-slate move around {theme}.",
          "Reset {theme} so it stops quietly draining attention.",
          "Use {theme} to create visible proof that life is moving again.",
          "Make {theme} lighter, clearer, and easier to return to."
        ]
      },
      "Burnout Recovery Reset": {
        count: 7,
        description: "A softer challenge for when pushing harder is no longer the right answer.",
        whatItBuilds: "relief, recovery, and a more survivable baseline",
        themes: ["pressure removal", "rest", "support", "expectations", "body care", "energy protection", "recovery design"],
        stems: [
          "Take a {paceWord} recovery action around {theme}.",
          "Lower the pressure around {theme} and protect your baseline.",
          "Let {theme} become simpler, slower, and more honest.",
          "Use {theme} to support recovery instead of performance."
        ]
      },
      "Sunday Reset System": {
        count: 7,
        description: "A weekly planning ritual that helps Monday feel less chaotic before it even starts.",
        whatItBuilds: "clarity, readiness, and steadier weekly momentum",
        themes: ["review", "unfinished tasks", "home reset", "priorities", "meals", "energy rule", "calendar"],
        stems: [
          "Use a {paceWord} Sunday step for {theme}.",
          "Organize {theme} so next week starts cleaner.",
          "Turn {theme} into a calm handoff between weeks.",
          "Create visible order around {theme} before Monday arrives."
        ]
      }
    };

    var challengeFocuses = {
      Clarity: ["mental fog", "decision clutter", "mixed feelings", "unfinished thoughts", "inner noise", "confused priorities"],
      Consistency: ["small routines", "repeatable basics", "keeping promises", "showing up again", "stable habits", "daily rhythm"],
      Confidence: ["self-belief", "voice", "cleaner choices", "courage", "less second-guessing", "personal momentum"],
      Calm: ["nervous system relief", "slower mornings", "less rushing", "softer evenings", "fewer loose ends", "quieter energy"],
      Energy: ["physical baseline", "sleep support", "restorative habits", "less depletion", "lighter effort", "better pacing"],
      Boundaries: ["saying no", "protecting your peace", "relationship honesty", "less overexplaining", "energy protection", "clearer limits"],
      "Follow-through": ["closing loops", "acting sooner", "visible wins", "keeping small commitments", "less avoidance", "finishing what matters"],
      Direction: ["longer-term clarity", "life chapter language", "what matters most", "future-self alignment", "personal truth", "next-step confidence"]
    };

    var challengePaces = {
      Gentle: {
        word: "gentle",
        cue: "This version lowers pressure and favors softness over intensity."
      },
      Steady: {
        word: "steady",
        cue: "This version aims for grounded follow-through without trying to overhaul everything at once."
      },
      Focused: {
        word: "focused",
        cue: "This version is more direct and asks for a little more structure, honesty, and visible action."
      }
    };

    var dayObjectives = [
      "notice what is true",
      "clear mental noise",
      "reduce invisible pressure",
      "build one clean system",
      "practice honest reflection",
      "create a visible win",
      "end with a calmer handoff"
    ];

    var poemStarts = [
      "You are allowed to rebuild slowly.",
      "Not every hard season means you are failing.",
      "A quieter life can still be a powerful life.",
      "Small proof still counts as proof.",
      "You do not need a dramatic breakthrough to be changing.",
      "The life you want can begin with one cleaner choice.",
      "Even a gentle reset is still a real reset."
    ];

    var poemEnds = [
      "Let this week become a steadier place to stand.",
      "Leave room for softness without leaving yourself behind.",
      "Make calm something you practice, not something you wait for.",
      "Let this chapter sound more like honesty than pressure.",
      "Keep choosing the version of life that feels livable.",
      "Trust the shape of progress that is actually yours.",
      "Carry less noise so you can hear yourself again."
    ];

    function resetPlan(input) {
      return {
        title: "Your next-week reset",
        blocks: [
          { label: "Release", value: input.heavy || "Name what felt heavy so it stops staying vague." },
          { label: "Must handle", value: input.mustDo || "Pick the few obligations that really matter first." },
          { label: "Make it calmer", value: input.calmer || "Choose 2-3 changes that would reduce friction next week." },
          { label: "Reset focus", value: "Protect mornings, close one overdue life-admin item, and choose one room or system to reset." }
        ]
      };
    }

    function scoreDecision(input) {
      var peaceWeight = Number(input.peaceWeight || 3);
      var growthWeight = Number(input.growthWeight || 3);
      var environmentWeight = Number(input.environmentWeight || 3);
      var optionAScore =
        peaceWeight * Number(input.optionAPeace || 3) +
        growthWeight * Number(input.optionAGrowth || 3) +
        environmentWeight * Number(input.optionAEnvironment || 3);
      var optionBScore =
        peaceWeight * Number(input.optionBPeace || 3) +
        growthWeight * Number(input.optionBGrowth || 3) +
        environmentWeight * Number(input.optionBEnvironment || 3);
      var recommendation = optionBScore > optionAScore ? input.optionB : optionAScore > optionBScore ? input.optionA : (input.lean === "B" ? input.optionB : input.optionA);
      var logicWinner = optionBScore > optionAScore ? input.optionB : optionAScore > optionBScore ? input.optionA : "Tie";
      var emotionalLean = input.lean === "A" ? input.optionA : input.lean === "B" ? input.optionB : "You feel split";
      var explanation = "";
      if (logicWinner === "Tie") {
        explanation = "Your weighted scores are very close, so the decision may depend more on emotional fit, timing, and what tradeoff you are actually willing to live with.";
      } else if (logicWinner === emotionalLean) {
        explanation = logicWinner + " currently wins on both your weighted priorities and your emotional lean. That usually means the direction is becoming clearer, even if it is still uncomfortable.";
      } else {
        explanation = logicWinner + " scores better on your stated priorities, but your emotional lean points more toward " + emotionalLean + ". That tension matters. It usually means one option looks smarter on paper while the other feels more personally alive or safer.";
      }
      return {
        title: input.title,
        optionA: input.optionA,
        optionB: input.optionB,
        optionAScore: optionAScore,
        optionBScore: optionBScore,
        recommendation: recommendation,
        logicWinner: logicWinner,
        emotionalLean: emotionalLean,
        desiredFeel: input.desiredFeel,
        explanation: explanation
      };
    }

    function generateExercise(input, salt) {
      var list = exerciseBank[input.category] || exerciseBank["Mental clarity"];
      var mappedCategory = input.category;
      var feeling = String(input.feeling || "").trim().toLowerCase();
      var need = String(input.need || "").trim().toLowerCase();
      if ((feeling.indexOf("indecis") >= 0 || need.indexOf("structure") >= 0) && input.category === "Mental clarity") {
        mappedCategory = "Decision making";
        list = exerciseBank[mappedCategory];
      }
      if ((feeling.indexOf("overwhelm") >= 0 || feeling.indexOf("burn") >= 0) && (input.season === "Recovery" || input.season === "Heavy")) {
        mappedCategory = "Low-energy support";
        list = exerciseBank[mappedCategory];
      }
      var index = Math.abs(hash(mappedCategory + "|" + input.feeling + "|" + input.need + "|" + input.season + "|" + input.mode + "|" + (salt || ""))) % list.length;
      var picked = list[index];
      var fitNote = "This worksheet was chosen from the " + mappedCategory.toLowerCase() + " library.";
      if (feeling || need) {
        fitNote += " It matches the kind of support you asked for without forcing your exact words into the prompts.";
      }
      if (feeling) fitNote += " Current feeling noted: " + feeling + ".";
      if (need) fitNote += " Need noted: " + need + ".";
      if (input.season) fitNote += " Season noted: " + String(input.season).toLowerCase() + ".";
      if (input.mode) fitNote += " Reflection style: " + String(input.mode).toLowerCase() + ".";
      return {
        category: mappedCategory,
        title: picked.title,
        note: picked.note,
        fitNote: fitNote,
        prompts: picked.prompts.slice(),
        action: picked.action,
        poem: buildMicroPoem(input.category + "|" + input.feeling + "|" + input.need + "|" + salt),
        poemText: picked.poemText || ""
      };
    }

    function generatePath(input) {
      var banks = {
        "Overwhelm Reset": ["Name what feels loudest.", "Sort what is urgent versus just loud.", "Choose one thing to drop for today.", "Create a 24-hour calmer plan."],
        "Self-Trust Rebuild": ["Name where you stop trusting yourself.", "Keep one small promise today.", "Write one honest sentence you have been avoiding.", "Choose one next step without polling everyone else."],
        "Breakup Recovery": ["Name what still hurts without minimizing it.", "Separate grief from self-blame.", "List what support would actually help.", "Write what healing would look like this month."],
        "Getting Life Back Together": ["Pick the one area creating the most drag.", "Reset the basics first.", "Choose three stabilizing moves.", "Build a one-week recovery rhythm."]
      };
      var steps = (banks[input.path] || banks["Overwhelm Reset"]).map(function (step, index) {
        return {
          label: "Step " + (index + 1),
          title: step,
          note: "This step is shaped for a " + String(input.season || "current").toLowerCase() + " season with a " + String(input.intensity || "steady").toLowerCase() + " pace."
        };
      });
      return {
        title: input.path,
        note: "A guided path is a deeper sequence for when one exercise is not enough.",
        poem: buildMicroPoem(input.path + "|" + input.season + "|" + input.intensity),
        steps: steps
      };
    }

    function generateResetKit(input) {
      var kits = {
        "Bad Day": ["Drink water and reduce expectations.", "Pick one room or surface to reset.", "Text one safe person or write one honest line.", "Choose the next smallest caring action."],
        "Sunday Reset": ["Review the last week.", "Clear your obvious loose ends.", "Pick top three priorities.", "Reset food, space, and calendar basics."],
        "After a Hard Conversation": ["Name what was said and what you felt.", "Separate fact from interpretation.", "Decide what follow-up, if any, is needed.", "Choose one thing that helps your body come down."],
        "When I Feel Behind": ["List what is actually urgent.", "Cross out what is only guilt.", "Choose one catch-up move.", "Redefine success for today."],
        "When Life Feels Messy": ["Start with visible order.", "Clear one mental loop.", "Pick one routine to protect.", "Design tomorrow to feel lighter."]
      };
      return {
        title: input.kit,
        note: "A reset kit gives you support for a specific moment without making you build the structure from scratch.",
        items: kits[input.kit] || kits["Bad Day"],
        poem: buildMicroPoem(input.kit)
      };
    }

    function runMindGame(input) {
      var text = String(input.input || "").trim();
      var lower = text.toLowerCase();
      if (input.game === "Season Finder") {
        var season = inferSeason(lower);
        return {
          kind: "season-finder",
          title: "Season Finder",
          summary: "This tool listens for the chapter your words point toward.",
          items: [
            { label: "Likely season", value: season.label },
            { label: "Why", value: season.description },
            { label: "Next move", value: "Choose exercises and paths that match this season instead of forcing the wrong pace." }
          ]
        };
      }
      if (input.game === "Control vs Release") {
        return {
          kind: "control-release",
          title: "Control vs Release",
          summary: "This tool helps you sort one heavy situation into what needs action, what needs patience, and what needs less mental weight.",
          focus: text || "what feels stuck right now",
          buckets: [
            {
              label: "Control",
              meaning: "What can you directly do in the next day or two?",
              prompt: "One small action I can take around this is ___."
            },
            {
              label: "Influence",
              meaning: "What can you support, shape, or improve slowly without trying to force it right now?",
              prompt: "The part I can influence over time is ___."
            },
            {
              label: "Release",
              meaning: "What part is costing too much mental energy tonight and does not need to stay in your hands right now?",
              prompt: "The part I need to release for now is ___."
            }
          ],
          action: "Fill out each bucket, then act on only the Control line first."
        };
      }
      var roulette = ["Do a 2-minute room reset.", "Put your phone away for ten minutes.", "Write one honest sentence.", "Drink water and step outside.", "Pick one thing that would make tonight easier."];
      var spin = roulette[Math.abs(hash(text || "reset")) % roulette.length];
      return {
        kind: "reset-roulette",
        title: "Reset Roulette",
        summary: "This tool gives you one small reset move so you do not stay stuck choosing forever.",
        items: [
          { label: "Your reset", value: spin },
          { label: "Why it helps", value: "A small action breaks spiraling faster than another round of overthinking." }
        ]
      };
    }

    function buildInsights(store) {
      var exerciseNeeds = store.exercises.map(function (item) { return item.fitNote || ""; }).join(" ").toLowerCase();
      var checkinNotes = store.checkins.map(function (item) { return item.note || ""; }).join(" ").toLowerCase();
      var insights = [];
      if (exerciseNeeds.indexOf("structure") >= 0 || checkinNotes.indexOf("structure") >= 0) {
        insights.push("You often mention wanting more structure. Systems that lower friction may help more than more motivation.");
      }
      if (checkinNotes.indexOf("calm") >= 0 || exerciseNeeds.indexOf("calm") >= 0) {
        insights.push("Calm keeps showing up as a real need. That suggests relief and pacing matter as much as productivity.");
      }
      if (!insights.length) {
        insights.push("As you save more check-ins, exercises, and decisions, Life OS will start pulling stronger themes forward.");
      }
      return insights;
    }

    function buildPatterns(store) {
      var moodCounts = {};
      store.checkins.forEach(function (item) {
        moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
      });
      var topMood = Object.keys(moodCounts).sort(function (a, b) { return moodCounts[b] - moodCounts[a]; })[0];
      return [
        { label: "Most logged mood", value: topMood ? topMood : "Not enough check-ins yet" },
        { label: "Current repeating season", value: store.seasonTimeline[0] ? store.seasonTimeline[0].season : (store.profile.currentSeason || "Not set") },
        { label: "Routine pressure point", value: store.routines.length ? "The next opportunity is making routines easier to keep on low-energy days." : "No routines saved yet." },
        { label: "Decision pattern", value: store.decisions.length ? "Your recent decisions are asking for clearer peace-versus-growth tradeoffs." : "No decisions scored yet." }
      ];
    }

    function inferSeason(input) {
      var text = String(input || "").toLowerCase();
      if (text.indexOf("burn") >= 0 || text.indexOf("exhaust") >= 0 || text.indexOf("drain") >= 0 || text.indexOf("heavy") >= 0) return seasonDefinitions.heavy;
      if (text.indexOf("recover") >= 0 || text.indexOf("heal") >= 0 || text.indexOf("rest") >= 0) return seasonDefinitions.recovery;
      if (text.indexOf("rebuild") >= 0 || text.indexOf("restart") >= 0 || text.indexOf("again") >= 0) return seasonDefinitions.rebuilding;
      if (text.indexOf("transition") >= 0 || text.indexOf("change") >= 0 || text.indexOf("move") >= 0 || text.indexOf("uncertain") >= 0) return seasonDefinitions.transition;
      if (text.indexOf("grow") >= 0 || text.indexOf("expand") >= 0 || text.indexOf("becoming") >= 0) return seasonDefinitions.growth;
      return seasonDefinitions.stabilizing;
    }

    function buildMicroPoem(seed) {
      var poemSeed = Math.abs(hash(seed || "everestpoint"));
      var first = poemStarts[poemSeed % poemStarts.length];
      var second = poemEnds[(poemSeed + 3) % poemEnds.length];
      return first + " " + second;
    }

    function buildChallengeStep(number, blueprint, focusArea, paceWord, seasonLabel, seed) {
      var stem = blueprint.stems[(seed + number) % blueprint.stems.length];
      var theme = blueprint.themes[(seed + number * 2) % blueprint.themes.length];
      var emphasis = focusArea[(seed + number * 3) % focusArea.length];
      var objective = dayObjectives[(seed + number * 5) % dayObjectives.length];
      var title = stem.replace("{paceWord}", paceWord).replace("{theme}", theme);
      return {
        label: (blueprint.count > 7 ? "Day " : "Day ") + number,
        title: title,
        note: "Focus on " + emphasis + " so you can " + objective + " during this " + seasonLabel.toLowerCase() + " season."
      };
    }

    function generateChallenge(input) {
      var blueprint = challengeBlueprints[input.track] || challengeBlueprints["7-Day Mental Reset"];
      var season = inferSeason(input.season);
      var focusArea = challengeFocuses[input.focus] || challengeFocuses.Clarity;
      var pace = challengePaces[input.pace] || challengePaces.Steady;
      var seed = Math.abs(hash([input.track, input.season, input.focus, input.pace, Date.now(), Math.random()].join("|")));
      var days = [];
      for (var i = 0; i < blueprint.count; i += 1) {
        days.push(buildChallengeStep(i + 1, blueprint, focusArea, pace.word, season.label, seed));
      }
      var totalVariations =
        Object.keys(challengeBlueprints).length *
        Object.keys(challengeFocuses).length *
        Object.keys(challengePaces).length *
        Object.keys(seasonDefinitions).length *
        poemStarts.length *
        poemEnds.length;
      return {
        title: input.track + " for a " + season.label + " season",
        season: input.season || season.label,
        seasonLabel: season.label,
        note: blueprint.description,
        seasonMeaning: season.description,
        focus: input.focus || "Clarity",
        focusNote: "This pack strengthens " + String(input.focus || "Clarity").toLowerCase() + " through a " + pace.word + " pace.",
        paceNote: pace.cue,
        whatItBuilds: blueprint.whatItBuilds,
        days: days,
        poem: buildMicroPoem(input.track + "|" + input.season + "|" + input.focus + "|" + input.pace + "|" + seed),
        totalVariations: totalVariations
      };
    }

    function hash(text) {
      var value = 0;
      String(text || "").split("").forEach(function (char, index) {
        value += char.charCodeAt(0) * (index + 1);
      });
      return value;
    }

    return {
      resetPlan: resetPlan,
      scoreDecision: scoreDecision,
      generateExercise: generateExercise,
      generateChallenge: generateChallenge,
      generatePath: generatePath,
      generateResetKit: generateResetKit,
      runMindGame: runMindGame,
      buildInsights: buildInsights,
      buildPatterns: buildPatterns,
      inferSeason: inferSeason
    };
  })();

  var Router = {
    view: function (name) {
      document.querySelectorAll("[data-view]").forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-view") === name);
      });
      document.querySelectorAll("[data-view-trigger]").forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-view-trigger") === name);
      });
      var title = document.querySelector("[data-page-title]");
      if (title) title.textContent = titleMap[name] || name;
      if (App.el.sidebar) App.el.sidebar.classList.remove("is-open");
      if (App.el.overlay) App.el.overlay.classList.remove("is-visible");
    }
  };

  var titleMap = {
    dashboard: "Dashboard",
    reset: "Weekly Reset",
    routines: "Routines",
    admin: "Life Admin",
    checkins: "Check-ins",
    areas: "Life Areas",
    decisions: "Decision Desk",
    exercises: "Exercises",
    paths: "Guided Paths",
    challenges: "Challenge Packs",
    resetkits: "Reset Kits",
    games: "Mind Games",
    patterns: "Pattern View",
    insights: "Saved Insights",
    wins: "Micro Wins",
    timeline: "Timeline",
    seasons: "Season Timeline",
    playbooks: "Playbooks",
    letters: "Private Letters",
    vault: "Vault",
    journal: "Journal"
  };

  function toast(message) {
    if (!App.el.toast) return;
    App.el.toast.textContent = message;
    App.el.toast.classList.add("show");
    clearTimeout(App.state.toastTimer);
    App.state.toastTimer = setTimeout(function () {
      App.el.toast.classList.remove("show");
    }, 1800);
  }

  function fakeLoad(el, message, callback) {
    if (el) el.textContent = message;
    setTimeout(function () {
      callback();
      if (el) el.textContent = "Ready";
    }, 420 + Math.floor(Math.random() * 300));
  }

  function dataFromForm(form) {
    var obj = {};
    new FormData(form).forEach(function (value, key) {
      obj[key] = value;
    });
    return obj;
  }

  function renderDashboard() {
    var store = Storage.read();
    if (App.el.seasonExplainer) {
      App.el.seasonExplainer.innerHTML = [
        "<div class='detail-pair'><span>Mood</span><strong>Mood is how you feel right now.</strong><p>Examples: overwhelmed, hopeful, numb, calm, anxious, proud.</p></div>",
        "<div class='detail-pair'><span>Season</span><strong>Season is the larger chapter of life you are in.</strong><p>Examples: rebuilding, recovery, transition, growth, stabilizing, heavy.</p></div>",
        "<div class='detail-pair'><span>Why it matters</span><strong>Life OS uses season to choose the kind of support you need.</strong><p>A recovery season needs softness. A growth season can handle more stretch. A stabilizing season needs systems that hold.</p></div>"
      ].join("");
    }
    if (App.el.profileSummary) {
      App.el.profileSummary.innerHTML = [
        "<div class='detail-pair'><span>North Star</span><strong>" + store.profile.northStar + "</strong></div>",
        "<div class='detail-pair'><span>Current Focus</span><strong>" + store.profile.focus + "</strong></div>",
        "<div class='detail-pair'><span>Energy</span><strong>" + store.profile.energy + "</strong></div>",
        "<div class='detail-pair'><span>Season</span><strong>" + store.profile.currentSeason + "</strong></div>"
      ].join("");
    }
    if (App.el.seasonGuide) {
      var seasonInfo = Engine.inferSeason(store.profile.currentSeason);
      App.el.seasonGuide.innerHTML = [
        "<div class='detail-pair'><span>What mood means</span><strong>Mood is how you feel right now. It can change hour by hour.</strong></div>",
        "<div class='detail-pair'><span>What season means</span><strong>Season is the chapter of life you are in right now. It explains your deeper needs, not just the feeling of the day.</strong></div>",
        "<div class='detail-pair'><span>Your current season</span><strong>" + seasonInfo.label + "</strong><p>" + seasonInfo.description + "</p></div>"
      ].join("");
    }
    if (App.el.homeFocus) {
      App.el.homeFocus.innerHTML = [
        "<article class='library-item'><span class='mini-label'>Weekly reset</span><h4>" + (store.reset ? "Reset ready" : "No reset saved yet") + "</h4><p>" + (store.reset ? store.reset.blocks[1].value : "Use Weekly Reset to build your next-week guide.") + "</p></article>",
        "<article class='library-item'><span class='mini-label'>Next admin item</span><h4>" + (store.admin[0] ? store.admin[0].title : "Nothing pending") + "</h4><p>" + (store.admin[0] ? ("Due " + (store.admin[0].dueDate || "soon")) : "You're clear for now.") + "</p></article>"
      ].join("");
    }
    if (App.el.metricRoutines) App.el.metricRoutines.textContent = store.routines.length;
    if (App.el.metricAdmin) App.el.metricAdmin.textContent = store.admin.filter(function (item) { return !item.done; }).length;
    if (App.el.metricJournal) App.el.metricJournal.textContent = store.journal.length;
  }

  function renderReset() {
    var store = Storage.read();
    if (!App.el.resetResults) return;
    if (!store.reset) {
      App.el.resetResults.innerHTML = "<p>Build a weekly reset to see your release list, must-handle items, and calmer-week plan.</p>";
      return;
    }
    App.el.resetResults.innerHTML = "<article class='surface-card'>" +
      "<h3>" + store.reset.title + "</h3>" +
      "<p><strong>What this output means:</strong> this board turns vague stress into clearer buckets so you can see what to release, what to handle, and what would make the next week feel lighter.</p>" +
      store.reset.blocks.map(function (block) {
        return "<div class='detail-pair'><span>" + block.label + "</span><strong>" + block.value + "</strong></div>";
      }).join("") +
      "</article>";
  }

  function renderRoutines() {
    var store = Storage.read();
    if (!App.el.routineResults) return;
    App.el.routineResults.innerHTML = store.routines.map(function (routine) {
      return "<article class='idea-card'><div class='results-header'><div><span class='mini-label'>" + routine.category + "</span><h3>" + routine.title + "</h3></div><span class='status-pill'>" + routine.frequency + "</span></div><p>" + routine.why + "</p></article>";
    }).join("");
  }

  function renderAdmin() {
    var store = Storage.read();
    if (!App.el.adminResults) return;
    var list = filterItems(store.admin, ["title", "area", "notes"]);
    App.el.adminResults.innerHTML = list.length ? list.map(function (item) {
      return "<article class='library-item'><div class='results-header'><div><span class='mini-label'>" + item.area + "</span><h4>" + item.title + "</h4></div><button class='button button-secondary button-small' type='button' data-admin-complete='" + item.id + "'>" + (item.done ? "Done" : "Complete") + "</button></div><p>" + (item.notes || "No extra notes") + "</p><p><strong>Due:</strong> " + (item.dueDate || "No date") + "</p></article>";
    }).join("") : "<p>No admin items found.</p>";
  }

  function renderCheckins() {
    var store = Storage.read();
    if (!App.el.checkinResults) return;
    var list = filterItems(store.checkins, ["mood", "energy", "season", "note"]);
    App.el.checkinResults.innerHTML = list.length ? list.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.mood + " • " + item.energy + " energy</span><h4>" + item.season + "</h4><p>" + item.note + "</p></article>";
    }).join("") : "<p>No check-ins yet.</p>";
  }

  function renderAreas() {
    var store = Storage.read();
    if (!App.el.areaResults) return;
    App.el.areaResults.innerHTML = store.areas.length ? "<div class='detail-pair'><span>How to read this</span><strong>Life Areas show where attention may be needed.</strong><p>This page is for balance. It helps you notice which parts of life feel steady, strained, or ready for repair.</p></div>" + store.areas.map(function (item) {
      return "<article class='idea-card'><div class='results-header'><div><span class='mini-label'>" + item.status + "</span><h3>" + item.area + "</h3></div></div><p>" + item.note + "</p></article>";
    }).join("") : "<p>No life areas saved yet.</p>";
  }

  function renderDecision() {
    var store = Storage.read();
    if (!App.el.decisionResults) return;
    if (!store.decisions.length) {
      App.el.decisionResults.innerHTML = "<p>Run a decision through the desk to see a recommendation and reasoning.</p>";
      return;
    }
    var item = store.decisions[0];
    App.el.decisionResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p><strong>What the score means:</strong> each score reflects how well each option matched the categories you personally weighted. Higher score means better fit with what you said matters most.</p><div class='detail-pair'><span>" + item.optionA + "</span><strong>Score " + item.optionAScore + "</strong></div><div class='detail-pair'><span>" + item.optionB + "</span><strong>Score " + item.optionBScore + "</strong></div><div class='detail-pair'><span>Logical winner</span><strong>" + item.logicWinner + "</strong></div><div class='detail-pair'><span>Emotional lean</span><strong>" + item.emotionalLean + "</strong></div><div class='detail-pair'><span>Recommendation</span><strong>" + item.recommendation + "</strong></div><p><strong>Why the system leaned this way:</strong> " + item.explanation + "</p><p><strong>The life feeling you said you want:</strong> " + item.desiredFeel + "</p></article>";
  }

  function renderExercises() {
    var store = Storage.read();
    if (!App.el.exerciseResults) return;
    if (!store.exercises.length) {
      App.el.exerciseResults.innerHTML = "<p>Generate an exercise to get a guided reflection, fill-in-the-blank activity, or mental reset tool.</p>";
      return;
    }
    var item = store.exercises[0];
    App.el.exerciseResults.innerHTML = "<article class='caption-card'><div class='results-header'><div><span class='mini-label'>" + item.category + "</span><h3>" + item.title + "</h3></div><button class='button button-secondary button-small' type='button' data-copy='" + encodeURIComponent(item.prompts.join("\n")) + "'>Copy</button></div><p><strong>What this helps with:</strong> " + item.note + "</p><p><strong>Why this one was chosen:</strong> " + item.fitNote + "</p><p><strong>What this output means:</strong> this is a guided worksheet. It is meant to help you get more honest and specific, not sound polished or perfect.</p>" + (item.poemText ? "<div class='poem-block'><span class='mini-label'>Poem</span><p>" + item.poemText.replace(/\n/g, "<br>") + "</p><p><strong>How to use the poem:</strong> notice what line hits you, how it makes you feel, and how it could apply to your day-to-day life.</p></div>" : "") + "<p><strong>How to use it:</strong> answer each line honestly, even if the answers feel unfinished. This is meant to help you open up, not sound polished.</p><div class='idea-details'>" + item.prompts.map(function (prompt, index) { return "<div class='detail-pair'><span>Prompt " + (index + 1) + "</span><strong>" + prompt + "</strong><textarea data-exercise-answer='" + index + "' placeholder='Write honestly here...'>" + (item.answers && item.answers[index] ? item.answers[index] : "") + "</textarea></div>"; }).join("") + "</div><div class='form-actions'><button class='button button-primary button-small' type='button' data-save-exercise>Save Completed Exercise</button><button class='button button-secondary button-small' type='button' data-save-vault='exercise'>Add to Vault</button></div><div class='poem-block'><span class='mini-label'>Closing line</span><p>" + item.poem + "</p></div><p><strong>After this exercise:</strong> " + item.action + "</p></article>";
  }

  function renderPaths() {
    var store = Storage.read();
    if (!App.el.pathResults) return;
    if (!store.paths.length) {
      App.el.pathResults.innerHTML = "<p>Build a guided path to see a deeper multi-step track.</p>";
      return;
    }
    var item = store.paths[0];
    App.el.pathResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p>" + item.note + "</p><p><strong>What this output means:</strong> a guided path is a deeper sequence. Instead of one reflection, it gives you a progression to move through over a few days or sessions.</p><div class='idea-details'>" + item.steps.map(function (step) { return "<div class='detail-pair'><span>" + step.label + "</span><strong>" + step.title + "</strong><p>" + step.note + "</p></div>"; }).join("") + "</div><div class='poem-block'><span class='mini-label'>Closing line</span><p>" + item.poem + "</p></div></article>";
  }

  function renderChallenges() {
    var store = Storage.read();
    if (App.el.challengeExplainer) {
      App.el.challengeExplainer.innerHTML = [
        "<div class='detail-pair'><span>What a challenge is</span><strong>A challenge is a guided path, not random advice.</strong><p>It gives you a sequence of steps that fit the chapter you are in.</p></div>",
        "<div class='detail-pair'><span>Why yours changes</span><strong>Track, season, focus, and pace all reshape the pack.</strong><p>That means the same track can feel softer, stronger, calmer, or more direct depending on what you choose.</p></div>",
        "<div class='detail-pair'><span>Variety</span><strong>Life OS can already shape thousands of combinations.</strong><p>So yes, generating at least 100 unique challenge paths is possible here, and you can keep regenerating for different angles.</p></div>"
      ].join("");
    }
    if (!App.el.challengeResults) return;
    if (!store.challenges.length) {
      App.el.challengeResults.innerHTML = "<p>Build a challenge pack to see a guided sequence you could unlock as a premium feature.</p>";
      return;
    }
    var item = store.challenges[0];
    App.el.challengeResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p><strong>What this is:</strong> " + item.note + "</p><p><strong>What this helps with:</strong> " + item.whatItBuilds + ".</p><p><strong>How this fits your season:</strong> " + item.seasonMeaning + "</p><p><strong>Why this pack was shaped this way:</strong> " + item.focusNote + " " + item.paceNote + "</p><div class='idea-details'>" + item.days.map(function (day) { return "<div class='detail-pair'><span>" + day.label + "</span><strong>" + day.title + "</strong><p>" + day.note + "</p></div>"; }).join("") + "</div><div class='form-actions'><button class='button button-secondary button-small' type='button' data-save-vault='challenge'>Add to Vault</button></div><div class='poem-block'><span class='mini-label'>Closing line</span><p>" + item.poem + "</p></div><p><strong>Why this feels premium:</strong> challenge packs turn Life OS into a guided system, not just a storage tool. This generator can shape " + item.totalVariations + "+ unique pack combinations before the daily sequencing even changes.</p></article>";
  }

  function renderResetKits() {
    var store = Storage.read();
    if (!App.el.resetkitResults) return;
    if (!store.resetKits.length) {
      App.el.resetkitResults.innerHTML = "<p>Open a reset kit to get a ready-made support pack.</p>";
      return;
    }
    var item = store.resetKits[0];
    App.el.resetkitResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p>" + item.note + "</p><p><strong>What this output means:</strong> this is a ready-made support pack for a specific moment. You do not have to follow it perfectly; it is here to lower friction when your brain is tired.</p>" + item.items.map(function (step, index) { return "<div class='detail-pair'><span>Move " + (index + 1) + "</span><strong>" + step + "</strong></div>"; }).join("") + "<div class='poem-block'><span class='mini-label'>Closing line</span><p>" + item.poem + "</p></div></article>";
  }

  function renderGames() {
    var store = Storage.read();
    if (!App.el.gameResults) return;
    if (!store.games.length) {
      App.el.gameResults.innerHTML = "<p>Run a mind game to turn reflection into a lower-pressure activity.</p>";
      return;
    }
    var item = store.games[0];
    if (item.kind === "control-release") {
      App.el.gameResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p>" + item.summary + "</p><p><strong>What this output means:</strong> this tool is for sorting pressure, not solving your whole life at once. `Control` is what you can directly do. `Influence` is what you can shape slowly. `Release` is what does not need full mental rent tonight.</p><div class='detail-pair'><span>Situation</span><strong>" + item.focus + "</strong><p>Use the three buckets below to sort what needs action, what needs patience, and what needs less mental weight.</p></div><div class='idea-details'>" + item.buckets.map(function (bucket, index) { return "<div class='detail-pair'><span>" + bucket.label + "</span><strong>" + bucket.meaning + "</strong><p>" + bucket.prompt + "</p><textarea data-game-answer='" + index + "' placeholder='Write your answer here...'>" + (item.answers && item.answers[index] ? item.answers[index] : "") + "</textarea></div>"; }).join("") + "</div><div class='form-actions'><button class='button button-primary button-small' type='button' data-save-game>Save Sorting</button></div><p><strong>Next step:</strong> " + item.action + "</p></article>";
      return;
    }
    App.el.gameResults.innerHTML = "<article class='surface-card'><h3>" + item.title + "</h3><p>" + item.summary + "</p><p><strong>What this output means:</strong> this is a low-pressure clarity tool. It is meant to help you notice direction faster, not produce a perfect answer.</p>" + item.items.map(function (entry) { return "<div class='detail-pair'><span>" + entry.label + "</span><strong>" + entry.value + "</strong></div>"; }).join("") + "</article>";
  }

  function renderPatterns() {
    var store = Storage.read();
    if (!App.el.patternResults) return;
    var patterns = Engine.buildPatterns(store);
    App.el.patternResults.innerHTML = "<div class='detail-pair'><span>How to read this</span><strong>Patterns are repeated signals, not permanent identity statements.</strong><p>Use this page to notice what keeps showing up so you can respond earlier and with more kindness.</p></div>" + patterns.map(function (item) {
      return "<div class='detail-pair'><span>" + item.label + "</span><strong>" + item.value + "</strong></div>";
    }).join("");
  }

  function renderInsights() {
    var store = Storage.read();
    if (!App.el.insightResults) return;
    var insights = Engine.buildInsights(store);
    App.el.insightResults.innerHTML = "<div class='detail-pair'><span>How to read this</span><strong>Insights are reflections pulled from what you keep saving, not judgments.</strong><p>They are meant to help you notice themes that may deserve more compassion, structure, or honesty.</p></div>" + insights.map(function (item, index) {
      return "<div class='detail-pair'><span>Insight " + (index + 1) + "</span><strong>" + item + "</strong></div>";
    }).join("");
  }

  function renderWins() {
    var store = Storage.read();
    if (!App.el.winResults) return;
    App.el.winResults.innerHTML = store.wins.length ? "<div class='detail-pair'><span>How to read this</span><strong>Micro wins are proof, not performance theater.</strong><p>Use this page to remember that progress still counts even when it looks small from the outside.</p></div>" + store.wins.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.area + "</span><h4>" + item.title + "</h4><p>" + item.note + "</p></article>";
    }).join("") : "<p>No micro wins saved yet.</p>";
  }

  function renderTimeline() {
    var store = Storage.read();
    if (!App.el.timelineResults) return;
    var list = filterItems(store.timeline, ["title", "notes", "date"]);
    App.el.timelineResults.innerHTML = list.length ? "<div class='detail-pair'><span>How to read this</span><strong>Your timeline is context, not pressure.</strong><p>It helps you remember hard chapters, turning points, and growth so your life does not blur together.</p></div>" + list.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.date + "</span><h4>" + item.title + "</h4><p>" + item.notes + "</p></article>";
    }).join("") : "<p>No milestones yet.</p>";
  }

  function renderSeasons() {
    var store = Storage.read();
    if (!App.el.seasonResults) return;
    App.el.seasonResults.innerHTML = store.seasonTimeline.length ? "<div class='detail-pair'><span>How to read this</span><strong>Season Timeline tracks the bigger chapters of your life.</strong><p>Mood can change daily. Seasons change more slowly and help explain what kind of support you may need over time.</p></div>" + store.seasonTimeline.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.date + "</span><h4>" + item.season + "</h4><p>" + item.notes + "</p></article>";
    }).join("") : "<p>No season changes saved yet.</p>";
  }

  function renderPlaybooks() {
    var store = Storage.read();
    if (!App.el.playbookResults) return;
    var list = filterItems(store.playbooks, ["title", "trigger", "steps"]);
    App.el.playbookResults.innerHTML = list.length ? list.map(function (item) {
      return "<article class='caption-card'><div class='results-header'><div><span class='mini-label'>Trigger</span><h3>" + item.title + "</h3></div><button class='button button-secondary button-small' type='button' data-copy='" + encodeURIComponent(item.steps.join("\n")) + "'>Copy</button></div><p>" + item.trigger + "</p><div class='idea-details'>" + item.steps.map(function (step) { return "<p>" + step + "</p>"; }).join("") + "</div></article>";
    }).join("") : "<p>No playbooks saved yet.</p>";
  }

  function renderLetters() {
    var store = Storage.read();
    if (!App.el.letterResults) return;
    var list = filterItems(store.letters, ["type", "title", "body"]);
    App.el.letterResults.innerHTML = list.length ? "<div class='detail-pair'><span>How to read this</span><strong>Private Letters are for honesty, not for sending.</strong><p>Use them when you need to say something clearly, process emotion, or write to a version of yourself with less pressure.</p></div>" + list.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.type + "</span><h4>" + item.title + "</h4><p>" + item.body + "</p></article>";
    }).join("") : "<p>No private letters saved yet.</p>";
  }

  function renderVault() {
    var store = Storage.read();
    if (!App.el.vaultResults) return;
    App.el.vaultResults.innerHTML = store.vault.length ? "<div class='detail-pair'><span>What the vault is for</span><strong>Your vault is your strongest saved material.</strong><p>Use it for the things you want to revisit, reuse, or remember when life feels noisy again.</p></div>" + store.vault.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.type + "</span><h4>" + item.title + "</h4><p>" + item.note + "</p></article>";
    }).join("") : "<p>Your vault is empty. Save standout exercises, challenges, resets, and reflections here.</p>";
  }

  function renderJournal() {
    var store = Storage.read();
    if (!App.el.journalResults) return;
    var list = filterItems(store.journal, ["title", "entry", "mood"]);
    App.el.journalResults.innerHTML = list.length ? "<div class='detail-pair'><span>How to read this</span><strong>Journal entries capture what felt true in the moment.</strong><p>Use them to build context over time, not to force every entry into a lesson.</p></div>" + list.map(function (item) {
      return "<article class='library-item'><span class='mini-label'>" + item.mood + "</span><h4>" + item.title + "</h4><p>" + item.entry + "</p></article>";
    }).join("") : "<p>No journal entries yet.</p>";
  }

  function filterItems(list, keys) {
    var term = App.state.searchTerm.toLowerCase();
    if (!term) return list;
    return list.filter(function (item) {
      return keys.some(function (key) {
        var value = item[key];
        if (Array.isArray(value)) value = value.join(" ");
        return String(value || "").toLowerCase().indexOf(term) >= 0;
      });
    });
  }

  function bindDashboard() {
    App.el.sidebar = document.querySelector("[data-sidebar]");
    App.el.overlay = document.querySelector("[data-sidebar-overlay]");
    App.el.toast = document.querySelector("[data-toast]");
    App.el.profileSummary = document.querySelector("[data-profile-summary]");
    App.el.seasonExplainer = document.querySelector("[data-season-explainer]");
    App.el.seasonGuide = document.querySelector("[data-season-guide]");
    App.el.homeFocus = document.querySelector("[data-home-focus]");
    App.el.metricRoutines = document.querySelector("[data-metric-routines]");
    App.el.metricAdmin = document.querySelector("[data-metric-admin]");
    App.el.metricJournal = document.querySelector("[data-metric-journal]");
    App.el.resetForm = document.querySelector("[data-reset-form]");
    App.el.resetStatus = document.querySelector("[data-reset-status]");
    App.el.resetResults = document.querySelector("[data-reset-results]");
    App.el.routineForm = document.querySelector("[data-routine-form]");
    App.el.routineResults = document.querySelector("[data-routine-results]");
    App.el.adminForm = document.querySelector("[data-admin-form]");
    App.el.adminResults = document.querySelector("[data-admin-results]");
    App.el.checkinForm = document.querySelector("[data-checkin-form]");
    App.el.checkinResults = document.querySelector("[data-checkin-results]");
    App.el.areaForm = document.querySelector("[data-area-form]");
    App.el.areaResults = document.querySelector("[data-area-results]");
    App.el.decisionForm = document.querySelector("[data-decision-form]");
    App.el.decisionStatus = document.querySelector("[data-decision-status]");
    App.el.decisionResults = document.querySelector("[data-decision-results]");
    App.el.exerciseForm = document.querySelector("[data-exercise-form]");
    App.el.exerciseStatus = document.querySelector("[data-exercise-status]");
    App.el.exerciseResults = document.querySelector("[data-exercise-results]");
    App.el.pathForm = document.querySelector("[data-path-form]");
    App.el.pathStatus = document.querySelector("[data-path-status]");
    App.el.pathResults = document.querySelector("[data-path-results]");
    App.el.challengeForm = document.querySelector("[data-challenge-form]");
    App.el.challengeExplainer = document.querySelector("[data-challenge-explainer]");
    App.el.challengeStatus = document.querySelector("[data-challenge-status]");
    App.el.challengeResults = document.querySelector("[data-challenge-results]");
    App.el.resetkitForm = document.querySelector("[data-resetkit-form]");
    App.el.resetkitStatus = document.querySelector("[data-resetkit-status]");
    App.el.resetkitResults = document.querySelector("[data-resetkit-results]");
    App.el.gameForm = document.querySelector("[data-game-form]");
    App.el.gameStatus = document.querySelector("[data-game-status]");
    App.el.gameResults = document.querySelector("[data-game-results]");
    App.el.patternResults = document.querySelector("[data-pattern-results]");
    App.el.insightResults = document.querySelector("[data-insight-results]");
    App.el.winForm = document.querySelector("[data-win-form]");
    App.el.winResults = document.querySelector("[data-win-results]");
    App.el.timelineForm = document.querySelector("[data-timeline-form]");
    App.el.timelineResults = document.querySelector("[data-timeline-results]");
    App.el.seasonForm = document.querySelector("[data-season-form]");
    App.el.seasonResults = document.querySelector("[data-season-results]");
    App.el.playbookForm = document.querySelector("[data-playbook-form]");
    App.el.playbookResults = document.querySelector("[data-playbook-results]");
    App.el.letterForm = document.querySelector("[data-letter-form]");
    App.el.letterResults = document.querySelector("[data-letter-results]");
    App.el.vaultResults = document.querySelector("[data-vault-results]");
    App.el.journalForm = document.querySelector("[data-journal-form]");
    App.el.journalResults = document.querySelector("[data-journal-results]");

    document.querySelectorAll("[data-view-trigger],[data-route-link]").forEach(function (button) {
      button.addEventListener("click", function () {
        Router.view(button.getAttribute("data-view-trigger") || button.getAttribute("data-route-link"));
      });
    });

    var open = document.querySelector("[data-sidebar-open]");
    var close = document.querySelector("[data-sidebar-close]");
    if (open) open.addEventListener("click", function () {
      App.el.sidebar.classList.add("is-open");
      App.el.overlay.classList.add("is-visible");
    });
    if (close) close.addEventListener("click", function () {
      App.el.sidebar.classList.remove("is-open");
      App.el.overlay.classList.remove("is-visible");
    });
    if (App.el.overlay) App.el.overlay.addEventListener("click", function () {
      App.el.sidebar.classList.remove("is-open");
      App.el.overlay.classList.remove("is-visible");
    });

    if (App.el.resetForm) App.el.resetForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.resetForm);
      fakeLoad(App.el.resetStatus, "Building reset...", function () {
        Storage.update(function (store) {
          store.reset = Engine.resetPlan(input);
        });
        renderAll();
        toast("Weekly reset saved");
      });
    });

    if (App.el.routineForm) App.el.routineForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.routineForm);
      Storage.update(function (store) {
        store.routines.unshift({ id: Storage.uid("routine"), title: input.title, category: input.category, frequency: input.frequency, why: input.why });
      });
      App.el.routineForm.reset();
      renderAll();
      toast("Routine added");
    });

    if (App.el.adminForm) App.el.adminForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.adminForm);
      Storage.update(function (store) {
        store.admin.unshift({ id: Storage.uid("admin"), title: input.title, area: input.area, dueDate: input.dueDate, notes: input.notes, done: false });
      });
      App.el.adminForm.reset();
      renderAll();
      toast("Admin item saved");
    });

    if (App.el.checkinForm) App.el.checkinForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.checkinForm);
      Storage.update(function (store) {
        store.checkins.unshift({ id: Storage.uid("checkin"), mood: input.mood, energy: input.energy, season: input.season, note: input.note, createdAt: new Date().toISOString() });
      });
      App.el.checkinForm.reset();
      renderAll();
      toast("Check-in saved");
    });

    if (App.el.areaForm) App.el.areaForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.areaForm);
      Storage.update(function (store) {
        store.areas.unshift({ id: Storage.uid("area"), area: input.area, status: input.status, note: input.note });
      });
      App.el.areaForm.reset();
      renderAll();
      toast("Life area saved");
    });

    if (App.el.decisionForm) App.el.decisionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.decisionForm);
      fakeLoad(App.el.decisionStatus, "Scoring decision...", function () {
        Storage.update(function (store) {
          store.decisions.unshift(Engine.scoreDecision(input));
        });
        renderAll();
        toast("Decision scored");
      });
    });

    if (App.el.exerciseForm) App.el.exerciseForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.exerciseForm);
      App.state.lastExerciseInput = input;
      fakeLoad(App.el.exerciseStatus, "Building exercise...", function () {
        Storage.update(function (store) {
          store.exercises.unshift(Engine.generateExercise(input, Date.now()));
        });
        renderAll();
        toast("Exercise generated");
      });
    });
    var regenExercise = document.querySelector("[data-regenerate-exercise]");
    if (regenExercise) regenExercise.addEventListener("click", function () {
      if (!App.state.lastExerciseInput) return;
      fakeLoad(App.el.exerciseStatus, "Refreshing exercise...", function () {
        Storage.update(function (store) {
          store.exercises.unshift(Engine.generateExercise(App.state.lastExerciseInput, Date.now() + Math.random()));
        });
        renderAll();
        toast("Exercise refreshed");
      });
    });

    if (App.el.pathForm) App.el.pathForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.pathForm);
      fakeLoad(App.el.pathStatus, "Building guided path...", function () {
        Storage.update(function (store) {
          store.paths.unshift(Engine.generatePath(input));
        });
        renderAll();
        toast("Guided path built");
      });
    });

    if (App.el.challengeForm) App.el.challengeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.challengeForm);
      fakeLoad(App.el.challengeStatus, "Building challenge pack...", function () {
        Storage.update(function (store) {
          store.challenges.unshift(Engine.generateChallenge(input));
        });
        renderAll();
        toast("Challenge pack generated");
      });
    });

    if (App.el.resetkitForm) App.el.resetkitForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.resetkitForm);
      fakeLoad(App.el.resetkitStatus, "Opening reset kit...", function () {
        Storage.update(function (store) {
          store.resetKits.unshift(Engine.generateResetKit(input));
        });
        renderAll();
        toast("Reset kit ready");
      });
    });

    if (App.el.gameForm) App.el.gameForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.gameForm);
      fakeLoad(App.el.gameStatus, "Running interactive tool...", function () {
        Storage.update(function (store) {
          store.games.unshift(Engine.runMindGame(input));
        });
        renderAll();
        toast("Mind game ready");
      });
    });

    if (App.el.winForm) App.el.winForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.winForm);
      Storage.update(function (store) {
        store.wins.unshift({ id: Storage.uid("win"), title: input.title, area: input.area, note: input.note, createdAt: new Date().toISOString() });
      });
      App.el.winForm.reset();
      renderAll();
      toast("Micro win saved");
    });

    if (App.el.timelineForm) App.el.timelineForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.timelineForm);
      Storage.update(function (store) {
        store.timeline.unshift({ id: Storage.uid("timeline"), title: input.title, date: input.date || new Date().toISOString().slice(0, 10), notes: input.notes });
      });
      App.el.timelineForm.reset();
      renderAll();
      toast("Milestone added");
    });

    if (App.el.seasonForm) App.el.seasonForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.seasonForm);
      Storage.update(function (store) {
        store.seasonTimeline.unshift({ id: Storage.uid("season"), season: input.season, date: input.date || new Date().toISOString().slice(0, 10), notes: input.notes });
      });
      App.el.seasonForm.reset();
      renderAll();
      toast("Season saved");
    });

    if (App.el.playbookForm) App.el.playbookForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.playbookForm);
      Storage.update(function (store) {
        store.playbooks.unshift({
          id: Storage.uid("playbook"),
          title: input.title,
          trigger: input.trigger,
          steps: String(input.steps || "").split("\n").map(function (step) { return step.trim(); }).filter(Boolean)
        });
      });
      App.el.playbookForm.reset();
      renderAll();
      toast("Playbook saved");
    });

    if (App.el.letterForm) App.el.letterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.letterForm);
      Storage.update(function (store) {
        store.letters.unshift({ id: Storage.uid("letter"), type: input.type, title: input.title, body: input.body, createdAt: new Date().toISOString() });
      });
      App.el.letterForm.reset();
      renderAll();
      toast("Letter saved");
    });

    if (App.el.journalForm) App.el.journalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = dataFromForm(App.el.journalForm);
      Storage.update(function (store) {
        store.journal.unshift({
          id: Storage.uid("journal"),
          title: input.title,
          mood: input.mood,
          entry: input.entry,
          createdAt: new Date().toISOString()
        });
      });
      App.el.journalForm.reset();
      renderAll();
      toast("Journal entry saved");
    });

    var search = document.querySelector("[data-global-search]");
    if (search) search.addEventListener("input", function () {
      App.state.searchTerm = search.value;
      renderAll();
    });

    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-admin-complete],[data-copy],[data-jump-view],[data-save-exercise],[data-save-vault],[data-save-game]");
      if (!target) return;
      if (target.hasAttribute("data-admin-complete")) {
        var id = target.getAttribute("data-admin-complete");
        Storage.update(function (store) {
          store.admin.forEach(function (item) {
            if (item.id === id) item.done = !item.done;
          });
        });
        renderAll();
        toast("Admin item updated");
      }
      if (target.hasAttribute("data-copy")) {
        copyText(decodeURIComponent(target.getAttribute("data-copy")));
      }
      if (target.hasAttribute("data-save-exercise")) {
        var answers = Array.prototype.slice.call(document.querySelectorAll("[data-exercise-answer]")).map(function (field) {
          return field.value.trim();
        });
        Storage.update(function (store) {
          if (store.exercises[0]) {
            store.exercises[0].answers = answers;
            store.exercises[0].completed = true;
          }
        });
        renderAll();
        toast("Exercise saved");
      }
      if (target.hasAttribute("data-save-vault")) {
        var source = target.getAttribute("data-save-vault");
        Storage.update(function (store) {
          var item = null;
          if (source === "exercise" && store.exercises[0]) {
            item = { id: Storage.uid("vault"), type: "Exercise", title: store.exercises[0].title, note: store.exercises[0].note };
          }
          if (source === "challenge" && store.challenges[0]) {
            item = { id: Storage.uid("vault"), type: "Challenge", title: store.challenges[0].title, note: store.challenges[0].note };
          }
          if (item) store.vault.unshift(item);
        });
        renderAll();
        toast("Saved to vault");
      }
      if (target.hasAttribute("data-save-game")) {
        var gameAnswers = Array.prototype.slice.call(document.querySelectorAll("[data-game-answer]")).map(function (field) {
          return field.value.trim();
        });
        Storage.update(function (store) {
          if (store.games[0]) {
            store.games[0].answers = gameAnswers;
          }
        });
        renderAll();
        toast("Mind game saved");
      }
      if (target.hasAttribute("data-jump-view")) {
        Router.view(target.getAttribute("data-jump-view"));
      }
    });

    renderAll();
  }

  function renderAll() {
    renderDashboard();
    renderReset();
    renderRoutines();
    renderAdmin();
    renderCheckins();
    renderAreas();
    renderDecision();
    renderExercises();
    renderPaths();
    renderChallenges();
    renderResetKits();
    renderGames();
    renderPatterns();
    renderInsights();
    renderWins();
    renderTimeline();
    renderSeasons();
    renderPlaybooks();
    renderLetters();
    renderVault();
    renderJournal();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast("Copied");
      });
      return;
    }
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("Copied");
  }

  function bindLanding() {
    var tabs = document.querySelectorAll("[data-showcase-tab]");
    var days = document.querySelectorAll("[data-showcase-day]");
    var label = document.querySelector("[data-showcase-output-label]");
    var title = document.querySelector("[data-showcase-output-title]");
    var text = document.querySelector("[data-showcase-output-text]");
    var inputs = document.querySelector("[data-showcase-inputs]");
    var previews = {
      dashboard: {
        label: "Dashboard",
        title: "Your week, reset into focus.",
        text: "See routines, overdue life admin, emotional energy, and what needs attention in one premium control center.",
        chips: ["Energy: 7/10", "Overdue tasks: 2", "Weekly reset: due Sunday"]
      },
      reset: {
        label: "Weekly Reset",
        title: "Close loops before the next week starts.",
        text: "Release what felt heavy, identify what must be handled, and decide what would make next week feel calmer.",
        chips: ["Release pressure", "Must-handle list", "Calmer-week plan"]
      },
      decision: {
        label: "Decision Desk",
        title: "Think clearly before you commit.",
        text: "Score real life choices against peace, money, space, growth, and the way you want life to feel after the decision.",
        chips: ["Option scoring", "Pros and cons", "Recommendation board"]
      },
      playbooks: {
        label: "Playbooks",
        title: "Your systems for the moments that repeat.",
        text: "Save your bad-day reset, Sunday reset, travel prep, budget reset, or any other system you want to run on repeat.",
        chips: ["Bad day reset", "Travel prep", "Budget reset"]
      }
    };

    function show(key) {
      var data = previews[key];
      if (!data || !label || !title || !text || !inputs) return;
      tabs.forEach(function (tab) {
        tab.classList.toggle("active", tab.getAttribute("data-showcase-tab") === key);
      });
      label.textContent = data.label;
      title.textContent = data.title;
      text.textContent = data.text;
      inputs.innerHTML = data.chips.map(function (chip) { return "<span>" + chip + "</span>"; }).join("");
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        show(tab.getAttribute("data-showcase-tab"));
      });
    });

    days.forEach(function (day, index) {
      day.addEventListener("click", function () {
        days.forEach(function (chip) { chip.classList.remove("active"); });
        day.classList.add("active");
        if (title) title.textContent = "Life area focus: " + day.textContent;
        if (text) text.textContent = "EverestPoint Life OS keeps " + day.textContent.toLowerCase() + " visible so your week feels managed instead of scattered.";
        if (inputs) {
          inputs.innerHTML = [
            "<span>Visible every week</span>",
            "<span>Saved in your system</span>",
            "<span>Connected to reset flow</span>"
          ].join("");
        }
      });
    });

    show("dashboard");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.classList.contains("dashboard-body")) bindDashboard();
    if (document.body.classList.contains("landing-body")) bindLanding();
  });
})();
