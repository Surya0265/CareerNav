import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTimelinePlanById } from '../services/plan';
import { completePhase } from '../services/timeline';
import { useToast } from '../components/shared/ToastContext';
import { Card, CardContent, CardHeader } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { MermaidChart } from '../components/MermaidChart';
import { EventBus } from '../utils/EventBus.ts'; // Import shared event bus

export const TimelineView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { push } = useToast();
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return navigate('/timeline');
      try {
        setLoading(true);
        const resp = await getTimelinePlanById(id);
        setPlan(resp.plan);
  // ensure selected index reset when plan loads
  setSelectedIdx(0);
      } catch (err) {
        console.error('Failed to load plan', err);
        push({ title: 'Error', description: 'Failed to load plan', tone: 'error' });
        navigate('/timeline');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // keep selectedIdx safe when phases array changes
  useEffect(() => {
    if (!plan) return;
    const phases = plan.phases || [];
    if (selectedIdx >= phases.length) setSelectedIdx(0);
  }, [plan, selectedIdx]);

  // Event listener for phase completion
  useEffect(() => {
    const handlePhaseCompleted = ({ planId, phaseOrder }: { planId: string; phaseOrder: number }) => {
      if (plan && plan._id === planId) {
        const updatedPhases = plan.phases.map((p: any) => {
          if (p.order === phaseOrder) {
            return { ...p, completed: true, completedAt: new Date().toISOString() };
          }
          return p;
        });
        setPlan({ ...plan, phases: updatedPhases });
      }
    };

    EventBus.on('phaseCompleted', handlePhaseCompleted);
    return () => {
      EventBus.off('phaseCompleted', handlePhaseCompleted);
    };
  }, [plan]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="py-10 flex justify-center"><Spinner /></div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) return null;

  const phases = plan.phases || [];
  const selected = phases[selectedIdx];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={plan.target_job || 'Saved plan'} description={new Date(plan.createdAt).toLocaleString()} />
        <CardContent>
          <div className="space-y-6">
            {/* Phases and Details */}
            <div className="grid lg:grid-cols-[300px_1fr] gap-6">
              <div>
                <div className="space-y-2">
                  {phases.map((p: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full text-left rounded-lg p-3 transition-colors ${
                        selectedIdx === idx
                          ? 'bg-blue-900 border-2 border-blue-500 text-white'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <div className="text-xs text-slate-400">
                            {p.duration_days ? `${Math.round(p.duration_days / 7)} weeks` : ''}
                          </div>
                        </div>
                        <div className="text-blue-400">→</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {/* Selected phase details */}
                {selected && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader
                        title={selected.title}
                        description={
                          selected.duration_days
                            ? `${Math.round(selected.duration_days / 7)} weeks`
                            : ''
                        }
                      />
                      <CardContent>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {selected.description}
                        </p>
                        <div className="mt-4">
                          {!selected.completed ? (
                            <button
                              className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded text-sm text-white"
                              onClick={async () => {
                                try {
                                  const res = await completePhase({
                                    planId: plan._id,
                                    phaseOrder: selected.order || selectedIdx + 1,
                                  });
                                  setPlan(res.plan);
                                  push({
                                    title: 'Phase completed',
                                    description: 'Marked as completed',
                                    tone: 'success',
                                  });
                                } catch (err) {
                                  console.error('Failed to mark complete', err);
                                  push({
                                    title: 'Error',
                                    description: 'Failed to mark phase',
                                    tone: 'error',
                                  });
                                }
                              }}
                            >
                              Mark phase complete
                            </button>
                          ) : (
                            <div className="text-sm text-slate-400">
                              Completed at{' '}
                              {selected.completedAt
                                ? new Date(selected.completedAt).toLocaleString()
                                : ''}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    {selected.skills && selected.skills.length > 0 && (
                      <Card>
                        <CardHeader
                          title="Skills to Learn"
                          description={`${selected.skills.length} skills`}
                        />
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selected.skills.map((s: string, i: number) => (
                              <div
                                key={i}
                                className="px-2 py-1 bg-slate-800 rounded text-xs"
                              >
                                ✓ {s}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Projects */}
                    {selected.projects && selected.projects.length > 0 && (
                      <Card>
                        <CardHeader
                          title="Projects to Build"
                          description={`${selected.projects.length} projects`}
                        />
                        <CardContent>
                          <ul className="space-y-2">
                            {selected.projects.map((proj: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-slate-300"
                              >
                                → {proj}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Milestones */}
                    {selected.milestones && selected.milestones.length > 0 && (
                      <Card>
                        <CardHeader
                          title="Milestones"
                          description={`${selected.milestones.length} milestones`}
                        />
                        <CardContent>
                          <ul className="space-y-2">
                            {selected.milestones.map((m: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-slate-300"
                              >
                                ✓ {m}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mermaid Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 overflow-x-auto">
              <MermaidChart
                chart={plan.mermaid_code || ''}
                onExportRef={(el) => (chartRef.current = el)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineView;
