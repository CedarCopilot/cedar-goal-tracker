'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import { DailyGoalCanvas } from '@/components/daily-goals/DailyGoalCanvas';
import { FloatingCedarChat } from '@/components/cedar-os/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/components/cedar-os/chatComponents/SidePanelCedarChat';
import { CedarCaptionChat } from '@/components/cedar-os/chatComponents/CedarCaptionChat';
import { useVoice } from 'cedar-os';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

export default function DailyGoalPage() {
  // [STEP 2]: To enable a chat, we have to add one of the Cedar Chat components to the app.
  // Here we render all three with a selector for you to play around!
  // All the components are downloaded to your repo, so feel free to click in and tweak the styling
  // At this point (after you've set up your env variables), you should be able to chat with the app.
  const [chatMode, setChatMode] = React.useState<ChatMode>('caption');
  const voice = useVoice();
  console.log('voice.isListening', voice.isListening);

  const renderContent = () => (
    <ReactFlowProvider>
      <div className="relative h-screen w-full">
        <DailyGoalCanvas />

        {chatMode === 'caption' && <CedarCaptionChat stream={false} />}

        {chatMode === 'floating' && (
          <FloatingCedarChat
            side="right"
            title="🚀 Daily Goal Assistant"
            collapsedLabel="💬 Need help with your daily goals?"
          />
        )}
      </div>
    </ReactFlowProvider>
  );

  if (chatMode === 'sidepanel') {
    return (
      <SidePanelCedarChat
        side="right"
        title="🚀 Daily Goal Assistant"
        collapsedLabel="💬 Need help with your daily goals?"
        showCollapsedButton={true}
      >
        {renderContent()}
      </SidePanelCedarChat>
    );
  }

  return renderContent();
}
