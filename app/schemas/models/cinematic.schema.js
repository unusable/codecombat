const c = require('./../schemas')

const ThangTypeSchema = (title, description) => c.object({
  title,
  description,
  required: ['slug']
}, {
  slug: c.shortString({
    title: 'Background Slug',
    description: 'The thangType slug of the asset'
  }),
  scaleX: c.float({
    title: 'scaleX',
    description: 'The scaling factor along x axis to apply to the ThangType'
  }),
  scaleY: c.float({
    title: 'scaleY',
    description: 'The scaling factor along y axis to apply to the ThangType'
  }),
  pos: c.point2d({
    title: 'Position',
    description: 'The position in meters to place the thangType.'
  })
})

const CharacterSchema = (title) => c.object({
  title: title,
  description: 'ThangType that will appear on either the left or right side of the screen.',
  required: ['type']
}, {
  type: { oneOf: [
    c.shortString({
      title: 'Type Hero',
      description: 'This character is the player character',
      default: 'hero',
      enum: ['hero']
    }),
    c.object({
      title: 'Type ThangType Slug',
      description: 'The thangType that will appear',
      required: ['slug']
    }, {
      slug: c.shortString({
        title: 'ThangType Slug',
        description: 'Required if type is set to `slug`',
        minLength: 1
      })
    })
  ] },
  enterOnStart: {
    type: 'boolean',
    title: 'Animate in?',
    description: 'If true the character will animate in. Otherwise the character will start simply there.'
  },
  position: c.point2d({ title: 'Position', description: 'Where character is located in meters' })
})

const ShotSetup = c.object({
  title: 'ShotSetup'
}, {
  cameraType: c.shortString({
    title: 'Camera Type',
    description: 'The shot type',
    enum: ['right-close', 'left-close', 'dual'],
    default: 'dual'
  }),
  rightThangType: CharacterSchema('Right Character'),
  leftThangType: CharacterSchema('Left Character'),
  backgroundArt: ThangTypeSchema('Background Art', 'The rasterized image to place on the background')
  // TODO: music
})

const DialogNode = c.object({
  title: 'Dialog Node',
  description: 'A node of a shot. Contains dialog instructions.',
  required: ['dialogClear']
}, {
  speaker: c.shortString({ enum: ['left', 'right'], title: 'Speaker', description: 'Which character is speaking. Used to select speech bubble.' }),
  text: { type: 'string', title: 'Text', description: 'html text', maxLength: 500 },
  i18n: { type: 'object', format: 'i18n', props: ['text'], description: 'Help translate this cinematic dialogNode.' },
  textLocation: c.object({ title: 'Text Location', description: 'An {x, y} coordinate point.', format: 'point2d', required: ['x', 'y'] }, {
    x: { title: 'x', description: 'The x coordinate.', type: 'number', 'default': 0 },
    y: { title: 'y', description: 'The y coordinate.', type: 'number', 'default': 0 } }),
  action: c.shortString({ title: 'Action', description: 'The action or animation to play on the speaker.' }),
  triggers: c.object({
    title: 'Triggers',
    description: 'Events that can occur during the dialogue.'
  }, {
    changeBackground: c.object({
      title: 'Change Background',
      description: 'Change the background image of the cinematic',
      required: ['art', 'triggerStart']
    }, {
      art: c.shortString({ title: 'Art', description: 'The background art path' }),
      triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of milliseconds until the background changes.' })
    }),
    backgroundObject: c.object({
      title: 'Background Object',
      description: 'Add a background object after given duration',
      required: ['thangType', 'triggerStart']
    }, {
      thangType: ThangTypeSchema('Background Object', 'The image to place'),
      triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of milliseconds until background image art appears' })
    }),
    clearBackgroundObject: c.object({
      title: 'Clear Background Object',
      description: 'Clears the background objects from the screen after a given duration'
    }, {
      triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of milliseconds until background object is cleared' })
    })
    // animationTrigger: c.object({
    //   title: 'Animation Trigger',
    //   description: 'Trigger to fire an animation on a character.',
    //   required: ['character', 'animation', 'triggerStart']
    // }, {
    //   character: c.shortString({ title: 'Character', enum: ['left', 'right'] }),
    //   animation: c.shortString({ title: 'Animation', description: 'The action or animation to play on the lank.' }),
    //   triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of milliseconds until animation plays' })
    // }),
    // soundEffect: c.sound({
    //   triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of millisecond before sound effect plays' })
    // }),
    // cameraShake: c.object({
    //   title: 'Camera shake',
    //   description: 'Shakes the camera.',
    //   required: ['triggerStart']
    // }, {
    //   triggerStart: c.int({ title: 'Trigger Start(ms)', description: 'The number of milliseconds until camera shakes' })
    // })
  }),
  dialogClear: {
    type: 'boolean',
    title: 'Clear dialog on screen',
    description: 'Whether we clear any existing dialog nodes.'
  },
  exitCharacter: c.shortString({ title: 'Exit Character', description: 'whether character exits at dialog node completion', enum: ['left', 'right', 'both'] }),
  filters: c.object({
    title: 'Filters',
    description: 'Context specific filters that are checked at runtime.'
  }, {
    language: c.shortString({ enum: ['python', 'javascript'], title: 'Language', description: 'If set, this Dialog Node is only shown for the given language.' })
  }),
  delay: c.int({ title: 'Delay(ms)', description: 'A delay in ms before anything else happens in this Dialog Node.' })
})

const Shot = c.object({
  title: 'Shot',
  description: 'A single shot, setting up camera and running dialog nodes'
}, {
  shotSetup: ShotSetup,
  dialogNodes: c.array({
    title: 'Dialog Nodes',
    description: 'List of all possible nodes in the shot.'
  }, DialogNode)
})

const CinematicSchema = c.object({
  description: 'A cinematic composed of shots.',
  title: 'Cinematic'
}, {
  shots: c.array({
    title: 'Shots',
    description: 'Ordered list of shots that make up a cinematic'
  }, Shot)
})

c.extendBasicProperties(CinematicSchema, 'cinematic')
c.extendNamedProperties(CinematicSchema)

module.exports = CinematicSchema
