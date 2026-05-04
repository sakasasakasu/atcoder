import fs from 'fs';
import path from 'path';

export default function Home() {
  // JSONファイルを読み込む
  const jsonPath = path.join(process.cwd(), 'public', 'problems.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const contests = JSON.parse(jsonData);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 border-b-2 border-green-500 pb-2">
        AtCoder 精進ログ
      </h1>
      
      <div className="grid gap-6">
        {contests.map((contest: any) => (
          <section key={contest.abc} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{contest.abc}</h2>
            <p className="text-gray-600 mb-4 italic">{contest.summary}</p>
            
            <div className="space-y-6">
              {contest.problems.map((prob: any) => (
                <div key={prob.id} className="pl-4 border-l-4 border-blue-400">
                  <h3 className="text-xl font-semibold mb-2">{prob.title}</h3>
                  <details>
                    <summary>{prob.id}を開く</summary>
                      <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                        <code>{prob.cpp}</code>
                      </pre>
                  </details>
                  <div className="prose prose-slate max-w-none">
                    {prob.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}